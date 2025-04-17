
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus, Search, Trash2 } from "lucide-react";

// Mock data for staff members
const staffData = [
  { 
    id: 1, 
    name: "Maria Garcia", 
    role: "Massage Therapist",
    email: "maria.garcia@serenespa.com",
    phone: "555-123-4567",
    skills: ["Swedish Massage", "Deep Tissue Massage", "Hot Stone Therapy", "Aromatherapy"],
    status: "active",
    avatar: "MG",
    schedule: "Full-time"
  },
  { 
    id: 2, 
    name: "Carlos Rodriguez", 
    role: "Massage Therapist",
    email: "carlos.rodriguez@serenespa.com",
    phone: "555-234-5678",
    skills: ["Deep Tissue Massage", "Sports Massage", "Thai Massage"],
    status: "active",
    avatar: "CR",
    schedule: "Part-time"
  },
  { 
    id: 3, 
    name: "Lisa Wang", 
    role: "Esthetician",
    email: "lisa.wang@serenespa.com",
    phone: "555-345-6789",
    skills: ["Facial Treatments", "Anti-Aging Treatments", "Chemical Peels"],
    status: "active",
    avatar: "LW",
    schedule: "Full-time"
  },
  { 
    id: 4, 
    name: "John Smith", 
    role: "Massage Therapist",
    email: "john.smith@serenespa.com",
    phone: "555-456-7890",
    skills: ["Swedish Massage", "Reflexology", "Shiatsu"],
    status: "inactive",
    avatar: "JS",
    schedule: "Part-time"
  },
  { 
    id: 5, 
    name: "Sarah Lee", 
    role: "Esthetician",
    email: "sarah.lee@serenespa.com",
    phone: "555-567-8901",
    skills: ["Facial Treatments", "Waxing", "Microblading"],
    status: "active",
    avatar: "SL",
    schedule: "Full-time"
  }
];

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Filter staff based on search term and status
  const filteredStaff = staffData.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Staff Management</h1>
        <Button className="bg-spa-600 hover:bg-spa-700">
          <Plus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>View and manage your staff members</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search staff..."
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
                  <th className="pb-3 font-medium">Staff Member</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Skills</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-spa-200 flex items-center justify-center text-spa-700 font-medium mr-3">
                            {staff.avatar}
                          </div>
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-gray-500">{staff.schedule}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">{staff.role}</td>
                      <td className="py-4">
                        <div className="text-sm">{staff.email}</div>
                        <div className="text-sm text-gray-500">{staff.phone}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-spa-50 text-spa-700 border-spa-200">
                              {skill}
                            </Badge>
                          ))}
                          {staff.skills.length > 2 && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                              +{staff.skills.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            staff.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No staff members found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Staff;
