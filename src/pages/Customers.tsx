
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Search, Trash2, CalendarIcon, ShoppingBag, Clock, UserCircle } from "lucide-react";

// Mock data for customers
const customersData = [
  {
    id: 1,
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "555-123-4567",
    joinDate: "2023-01-15",
    lastVisit: "2023-04-14",
    visits: 8,
    spent: 750,
    status: "active",
    preferences: ["Swedish Massage", "Aromatherapy"],
    notes: "Prefers female therapists. Has back sensitivity."
  },
  {
    id: 2,
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "555-234-5678",
    joinDate: "2023-02-22",
    lastVisit: "2023-04-17",
    visits: 5,
    spent: 450,
    status: "active",
    preferences: ["Deep Tissue Massage", "Hot Stone Therapy"],
    notes: "Athlete, focuses on shoulder and leg recovery."
  },
  {
    id: 3,
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    phone: "555-345-6789",
    joinDate: "2022-11-05",
    lastVisit: "2023-04-17",
    visits: 12,
    spent: 1200,
    status: "active",
    preferences: ["Facial Treatment", "Anti-Aging Treatment"],
    notes: "Sensitive skin, allergic to lavender."
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "555-456-7890",
    joinDate: "2023-03-10",
    lastVisit: "2023-04-10",
    visits: 3,
    spent: 350,
    status: "inactive",
    preferences: ["Hot Stone Therapy", "Reflexology"],
    notes: "Recovering from knee surgery."
  },
  {
    id: 5,
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
    phone: "555-567-8901",
    joinDate: "2022-12-18",
    lastVisit: "2023-04-05",
    visits: 6,
    spent: 520,
    status: "active",
    preferences: ["Aromatherapy", "Swedish Massage"],
    notes: "Prefers morning appointments."
  }
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  
  // Filter customers based on search term and status
  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get selected customer details
  const customerDetails = selectedCustomer 
    ? customersData.find(customer => customer.id === selectedCustomer) 
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Customer Management</h1>
        <Button className="bg-spa-600 hover:bg-spa-700">
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
                <Tabs defaultValue="all" value={filterStatus} onValueChange={setFilterStatus}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Visits</th>
                    <th className="pb-3 font-medium">Spent</th>
                    <th className="pb-3 font-medium">Last Visit</th>
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
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">Since {new Date(customer.joinDate).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4">
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </td>
                        <td className="py-4">{customer.visits}</td>
                        <td className="py-4">${customer.spent}</td>
                        <td className="py-4">{new Date(customer.lastVisit).toLocaleDateString()}</td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No customers found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              {customerDetails 
                ? `Complete information about ${customerDetails.name}`
                : "Select a customer to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customerDetails ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{customerDetails.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        customerDetails.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></span>
                      {customerDetails.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span>Customer since {new Date(customerDetails.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-spa-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Total Visits</div>
                    <div className="text-2xl font-semibold text-spa-700">{customerDetails.visits}</div>
                  </div>
                  <div className="bg-sage-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Total Spent</div>
                    <div className="text-2xl font-semibold text-sage-700">${customerDetails.spent}</div>
                  </div>
                  <div className="bg-sand-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Last Visit</div>
                    <div className="text-2xl font-semibold text-sand-700">
                      {new Date(customerDetails.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
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
                
                <div className="space-y-3">
                  <h4 className="font-medium">Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {customerDetails.preferences.map((pref, index) => (
                      <span key={index} className="px-2 py-1 bg-spa-100 text-spa-700 rounded text-xs">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{customerDetails.notes}</p>
                </div>
                
                <div className="pt-2 space-y-3">
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-spa-600 hover:bg-spa-700">
                      <CalendarIcon className="mr-2 h-4 w-4" /> New Appointment
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ShoppingBag className="mr-2 h-4 w-4" /> Add Purchase
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Clock className="mr-2 h-4 w-4" /> View History
                  </Button>
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
    </div>
  );
};

export default Customers;
