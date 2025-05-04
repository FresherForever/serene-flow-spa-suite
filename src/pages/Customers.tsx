import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Search, Trash2, CalendarIcon, ShoppingBag, Clock, UserCircle } from "lucide-react";
import { Customer, customerService } from "@/lib/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from "@/components/CustomerForm";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const { toast } = useToast();
  
  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error loading customers",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
    
    // For now, we don't have status in our backend model, so we'll show all
    return matchesSearch;
  });
  
  // Get selected customer details
  const customerDetails = selectedCustomer 
    ? customers.find(customer => customer.id === selectedCustomer) 
    : null;

  // Handle adding a new customer
  const handleAddCustomer = async (data: any) => {
    try {
      const newCustomer = await customerService.create(data);
      setCustomers([...customers, newCustomer]);
      setIsAddFormOpen(false);
      toast({
        title: "Customer added",
        description: "New customer has been successfully added",
      });
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error adding customer",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Handle editing a customer
  const handleEditCustomer = async (data: any) => {
    if (!customerToEdit || !customerToEdit.id) return;
    
    try {
      const updatedCustomer = await customerService.update(customerToEdit.id, data);
      
      setCustomers(customers.map(customer => 
        customer.id === customerToEdit.id ? updatedCustomer : customer
      ));
      
      setIsEditFormOpen(false);
      setCustomerToEdit(null);
      
      toast({
        title: "Customer updated",
        description: "Customer information has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error updating customer",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (id: string) => {
    try {
      await customerService.delete(id);
      setCustomers(customers.filter(customer => customer.id !== id));
      if (selectedCustomer === id) {
        setSelectedCustomer(null);
      }
      toast({
        title: "Customer deleted",
        description: "Customer has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error deleting customer",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Open edit form for a customer
  const openEditForm = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsEditFormOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Customer Management</h1>
        <Button 
          className="bg-spa-600 hover:bg-spa-700"
          onClick={() => setIsAddFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription>View and manage your customers</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-9 w-[240px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading customers...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Contact</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} 
                            className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                              selectedCustomer === customer.id ? 'bg-spa-50' : ''
                            }`}
                            onClick={() => setSelectedCustomer(customer.id)}>
                          <td className="py-4">
                            <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                            <div className="text-sm text-gray-500">
                              Since {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="text-sm">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </td>
                          <td className="py-4">
                            {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(customer);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                if (customer.id) {
                                  handleDeleteCustomer(customer.id);
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          {customers.length === 0 ? 'No customers found. Add your first customer!' : 'No customers found matching your search criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              {customerDetails 
                ? `Complete information about ${customerDetails.firstName} ${customerDetails.lastName}`
                : "Select a customer to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customerDetails ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{customerDetails.firstName} {customerDetails.lastName}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>Customer since {new Date(customerDetails.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email:</span>
                      <span>{customerDetails.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phone:</span>
                      <span>{customerDetails.phone}</span>
                    </div>
                  </div>
                </div>
                
                {customerDetails.birthdate && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Birth Date</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(customerDetails.birthdate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                {customerDetails.notes && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{customerDetails.notes}</p>
                  </div>
                )}
                
                <div className="pt-2 space-y-3">
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-spa-600 hover:bg-spa-700">
                      <CalendarIcon className="mr-2 h-4 w-4" /> New Appointment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => openEditForm(customerDetails)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Customer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <UserCircle className="h-12 w-12 mb-4 text-gray-300" />
                <p>Select a customer from the list to view their details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Customer Form Dialog */}
      <CustomerForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddCustomer}
        title="Add New Customer"
      />

      {/* Edit Customer Form Dialog */}
      <CustomerForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setCustomerToEdit(null);
        }}
        onSubmit={handleEditCustomer}
        initialData={customerToEdit}
        title="Edit Customer"
      />
    </div>
  );
};

export default Customers;
