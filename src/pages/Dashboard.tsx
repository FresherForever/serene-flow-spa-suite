
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, UserCircle, Users } from "lucide-react";

// Mock data for dashboard
const todaysAppointments = [
  { id: 1, time: "09:00 AM", customer: "Emma Thompson", service: "Swedish Massage", staff: "Maria Garcia", status: "Confirmed" },
  { id: 2, time: "10:30 AM", customer: "James Wilson", service: "Deep Tissue Massage", staff: "Carlos Rodriguez", status: "Checked In" },
  { id: 3, time: "11:45 AM", customer: "Sophie Martin", service: "Facial Treatment", staff: "Lisa Wang", status: "Confirmed" },
  { id: 4, time: "01:00 PM", customer: "Michael Brown", service: "Hot Stone Therapy", staff: "Maria Garcia", status: "Confirmed" },
  { id: 5, time: "02:30 PM", customer: "Olivia Davis", service: "Aromatherapy", staff: "Carlos Rodriguez", status: "Confirmed" },
];

const staffAvailable = [
  { id: 1, name: "Maria Garcia", role: "Massage Therapist", avatar: "MG" },
  { id: 2, name: "Carlos Rodriguez", role: "Massage Therapist", avatar: "CR" },
  { id: 3, name: "Lisa Wang", role: "Esthetician", avatar: "LW" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-spa-100 rounded-full">
                <Calendar className="h-6 w-6 text-spa-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-sage-100 rounded-full">
                <Users className="h-6 w-6 text-sage-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Available Staff</p>
                <h3 className="text-2xl font-bold">5</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-sand-100 rounded-full">
                <UserCircle className="h-6 w-6 text-sand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">New Customers</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-spa-100 rounded-full">
                <DollarSign className="h-6 w-6 text-spa-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                <h3 className="text-2xl font-bold">$1,250</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Appointments */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>Scheduled appointments for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Staff</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b last:border-0 hover:bg-gray-50 text-sm">
                    <td className="py-4 flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      {appointment.time}
                    </td>
                    <td className="py-4">{appointment.customer}</td>
                    <td className="py-4">{appointment.service}</td>
                    <td className="py-4">{appointment.staff}</td>
                    <td className="py-4">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Checked In" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Available Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Available Staff</CardTitle>
            <CardDescription>Staff members available today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffAvailable.map((staff) => (
                <div key={staff.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="h-10 w-10 rounded-full bg-spa-200 flex items-center justify-center text-spa-700 font-medium mr-3">
                    {staff.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-sm text-gray-500">{staff.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to streamline your workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center p-4 border rounded-lg hover:bg-spa-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-spa-100 flex items-center justify-center text-spa-600 mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">New Appointment</div>
                  <div className="text-sm text-gray-500">Schedule a new booking</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 border rounded-lg hover:bg-spa-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 mr-3">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Check-in Client</div>
                  <div className="text-sm text-gray-500">Mark appointment as arrived</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 border rounded-lg hover:bg-spa-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-sand-100 flex items-center justify-center text-sand-600 mr-3">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Process Payment</div>
                  <div className="text-sm text-gray-500">Collect payment for services</div>
                </div>
              </button>
              
              <button className="flex items-center p-4 border rounded-lg hover:bg-spa-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-spa-100 flex items-center justify-center text-spa-600 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">New Customer</div>
                  <div className="text-sm text-gray-500">Add a new customer profile</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
