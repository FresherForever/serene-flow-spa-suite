
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

// Mock data for appointments
const appointments = {
  "2023-04-17": [
    { id: 1, time: "09:00", endTime: "10:00", customer: "Emma Thompson", service: "Swedish Massage", staff: "Maria Garcia", status: "Confirmed" },
    { id: 2, time: "10:30", endTime: "11:30", customer: "James Wilson", service: "Deep Tissue Massage", staff: "Carlos Rodriguez", status: "Checked In" },
    { id: 3, time: "13:00", endTime: "14:00", customer: "Sophie Martin", service: "Facial Treatment", staff: "Lisa Wang", status: "Confirmed" },
  ],
  "2023-04-18": [
    { id: 4, time: "09:30", endTime: "10:30", customer: "Michael Brown", service: "Hot Stone Therapy", staff: "Maria Garcia", status: "Confirmed" },
    { id: 5, time: "11:00", endTime: "12:00", customer: "Olivia Davis", service: "Aromatherapy", staff: "Carlos Rodriguez", status: "Confirmed" },
  ],
  "2023-04-19": [
    { id: 6, time: "14:00", endTime: "15:00", customer: "Daniel Smith", service: "Sports Massage", staff: "Maria Garcia", status: "Confirmed" },
    { id: 7, time: "16:30", endTime: "17:30", customer: "Ava Johnson", service: "Anti-Aging Facial", staff: "Lisa Wang", status: "Confirmed" },
  ]
};

// Mock data for time slots
const timeSlots = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Mock data for staff
const staff = ["Maria Garcia", "Carlos Rodriguez", "Lisa Wang", "John Smith", "Sarah Lee"];

const Appointments = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<string>("day");
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  
  // Get current date in YYYY-MM-DD format
  const formattedDate = currentDate.toISOString().split("T")[0];

  // Date navigation
  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get appointments for the current date
  const todaysAppointments = appointments[formattedDate] || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
        <Button className="bg-spa-600 hover:bg-spa-700">
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>View and manage all appointments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="day" className="w-full" value={activeView} onValueChange={setActiveView}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={prevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{formatDisplayDate(currentDate)}</span>
                </div>
                <Button variant="outline" size="icon" onClick={nextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="day" className="mt-0">
              <div className="grid grid-cols-[100px_1fr] h-[600px] border rounded-md overflow-hidden">
                {/* Time slots column */}
                <div className="border-r bg-gray-50">
                  <div className="h-12 border-b"></div> {/* Empty header cell */}
                  <div className="overflow-y-auto h-[calc(600px-3rem)]">
                    {timeSlots.map((time) => (
                      <div key={time} className="h-12 flex items-center justify-center text-sm text-gray-500 border-b">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Calendar content */}
                <div>
                  {selectedStaff === "all" ? (
                    <div className="grid grid-cols-3 h-full">
                      {staff.slice(0, 3).map((staffMember) => (
                        <div key={staffMember} className="border-r last:border-r-0">
                          <div className="h-12 flex items-center justify-center border-b font-medium bg-gray-50">
                            {staffMember}
                          </div>
                          <div className="relative h-[calc(600px-3rem)]">
                            {todaysAppointments
                              .filter(appt => appt.staff === staffMember)
                              .map((appointment) => {
                                // Calculate position and height based on time
                                const startHour = parseInt(appointment.time.split(':')[0]);
                                const startMinute = parseInt(appointment.time.split(':')[1]);
                                const endHour = parseInt(appointment.endTime.split(':')[0]);
                                const endMinute = parseInt(appointment.endTime.split(':')[1]);
                                
                                const startPosition = (startHour - 9) * 48 + startMinute * 0.8;
                                const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
                                
                                return (
                                  <div
                                    key={appointment.id}
                                    className="absolute left-2 right-2 rounded-md px-2 py-1 bg-spa-100 border border-spa-200 overflow-hidden text-xs"
                                    style={{
                                      top: `${startPosition}px`,
                                      height: `${duration}px`,
                                    }}
                                  >
                                    <div className="font-medium text-spa-800">{appointment.customer}</div>
                                    <div className="text-spa-600">{appointment.service}</div>
                                    <div>{appointment.time} - {appointment.endTime}</div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full">
                      <div className="h-12 flex items-center justify-center border-b font-medium bg-gray-50">
                        {selectedStaff}
                      </div>
                      <div className="relative h-[calc(600px-3rem)]">
                        {todaysAppointments
                          .filter(appt => appt.staff === selectedStaff)
                          .map((appointment) => {
                            // Calculate position and height based on time
                            const startHour = parseInt(appointment.time.split(':')[0]);
                            const startMinute = parseInt(appointment.time.split(':')[1]);
                            const endHour = parseInt(appointment.endTime.split(':')[0]);
                            const endMinute = parseInt(appointment.endTime.split(':')[1]);
                            
                            const startPosition = (startHour - 9) * 48 + startMinute * 0.8;
                            const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
                            
                            return (
                              <div
                                key={appointment.id}
                                className="absolute left-2 right-2 rounded-md px-3 py-2 bg-spa-100 border border-spa-200 overflow-hidden"
                                style={{
                                  top: `${startPosition}px`,
                                  height: `${duration}px`,
                                }}
                              >
                                <div className="font-medium text-spa-800">{appointment.customer}</div>
                                <div className="text-spa-600">{appointment.service}</div>
                                <div className="text-sm">{appointment.time} - {appointment.endTime}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="week">
              <div className="h-[600px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Week view will be implemented in the next phase.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="month">
              <div className="h-[600px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Month view will be implemented in the next phase.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
