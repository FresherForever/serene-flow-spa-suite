
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your spa's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue="SereneSpa Wellness Center" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Address</Label>
                  <Input id="businessAddress" defaultValue="123 Tranquility Lane" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessCity">City</Label>
                    <Input id="businessCity" defaultValue="Serenity Springs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessZip">ZIP Code</Label>
                    <Input id="businessZip" defaultValue="12345" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone Number</Label>
                  <Input id="businessPhone" defaultValue="555-123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input id="businessEmail" defaultValue="info@serenespa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input id="businessWebsite" defaultValue="www.serenespa.com" />
                </div>
                <Button className="mt-2 bg-spa-600 hover:bg-spa-700">Save Changes</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your spa's operating hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox id={`day-${day}`} defaultChecked={day !== "Sunday"} />
                        <Label htmlFor={`day-${day}`} className="min-w-[100px]">{day}</Label>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Select defaultValue={day === "Sunday" ? "closed" : "09:00"}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>to</span>
                        <Select defaultValue={day === "Sunday" ? "closed" : day === "Saturday" ? "17:00" : "19:00"}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                            <SelectItem value="19:00">7:00 PM</SelectItem>
                            <SelectItem value="20:00">8:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-2 bg-spa-600 hover:bg-spa-700">Save Hours</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>Configure your spa's service offerings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end mb-4">
                <Button className="bg-spa-600 hover:bg-spa-700">Add New Service</Button>
              </div>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Swedish Massage</h3>
                      <p className="text-sm text-gray-500">Relaxing full-body massage</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm">60 minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm">$85.00</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm">Massage Therapy</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Deep Tissue Massage</h3>
                      <p className="text-sm text-gray-500">Targets deeper muscles with firmer pressure</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm">60 minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm">$95.00</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm">Massage Therapy</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Facial Treatment</h3>
                      <p className="text-sm text-gray-500">Cleansing and rejuvenating facial care</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm">45 minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm">$75.00</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm">Skin Care</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure automated notifications and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appointment Reminders</h3>
                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Reminders</Label>
                      <p className="text-sm text-gray-500">Send email reminders to customers before appointments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="ml-6 mt-2">
                    <Label className="text-sm">Reminder Timing</Label>
                    <Select defaultValue="24">
                      <SelectTrigger className="w-full max-w-xs mt-1">
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Reminders</Label>
                      <p className="text-sm text-gray-500">Send text message reminders to customers</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="ml-6 mt-2">
                    <Label className="text-sm">Reminder Timing</Label>
                    <Select defaultValue="3">
                      <SelectTrigger className="w-full max-w-xs mt-1">
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="3">3 hours before</SelectItem>
                        <SelectItem value="4">4 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Staff Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">New Appointment Alerts</Label>
                      <p className="text-sm text-gray-500">Notify staff when they are assigned new appointments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Schedule Changes</Label>
                      <p className="text-sm text-gray-500">Notify staff when their schedule is changed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Daily Schedule Email</Label>
                      <p className="text-sm text-gray-500">Send staff their daily appointment schedule</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Templates</h3>
                <div className="space-y-2">
                  <Label htmlFor="appointmentConfirmation">Appointment Confirmation</Label>
                  <Textarea id="appointmentConfirmation" className="min-h-[100px]" defaultValue="Dear {customer_name},\n\nThis email confirms your appointment for {service_name} on {appointment_date} at {appointment_time}.\n\nWe look forward to seeing you!\n\nSincerely,\nThe SereneSpa Team" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentReminder">Appointment Reminder</Label>
                  <Textarea id="appointmentReminder" className="min-h-[100px]" defaultValue="Dear {customer_name},\n\nThis is a friendly reminder of your upcoming appointment for {service_name} on {appointment_date} at {appointment_time}.\n\nPlease contact us if you need to reschedule.\n\nSincerely,\nThe SereneSpa Team" />
                </div>
              </div>
              
              <Button className="bg-spa-600 hover:bg-spa-700">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end mb-4">
                <Button className="bg-spa-600 hover:bg-spa-700">Add New User</Button>
              </div>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-spa-200 flex items-center justify-center text-spa-700 font-medium mr-3">
                              SA
                            </div>
                            <div className="font-medium">Spa Admin</div>
                          </div>
                        </td>
                        <td className="py-4">admin@serenespa.com</td>
                        <td className="py-4">Administrator</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Deactivate</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-spa-200 flex items-center justify-center text-spa-700 font-medium mr-3">
                              JD
                            </div>
                            <div className="font-medium">Jane Doe</div>
                          </div>
                        </td>
                        <td className="py-4">jane.doe@serenespa.com</td>
                        <td className="py-4">Manager</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Deactivate</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-spa-200 flex items-center justify-center text-spa-700 font-medium mr-3">
                              JS
                            </div>
                            <div className="font-medium">John Smith</div>
                          </div>
                        </td>
                        <td className="py-4">john.smith@serenespa.com</td>
                        <td className="py-4">Receptionist</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Deactivate</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-medium">Role Permissions</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left text-sm font-medium">
                          <th className="py-3 px-4 border-b">Permission</th>
                          <th className="py-3 px-4 border-b text-center">Administrator</th>
                          <th className="py-3 px-4 border-b text-center">Manager</th>
                          <th className="py-3 px-4 border-b text-center">Receptionist</th>
                          <th className="py-3 px-4 border-b text-center">Therapist</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-4">View Dashboard</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">Manage Appointments</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">View Staff</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">Manage Staff</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">View Customers</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">Manage Customers</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4">Manage Settings</td>
                          <td className="py-2 px-4 text-center"><Checkbox checked disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                          <td className="py-2 px-4 text-center"><Checkbox disabled /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
