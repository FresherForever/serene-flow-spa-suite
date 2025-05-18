import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Customer } from "@/lib/services/customerService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, setYear, setMonth, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form validation schema
const customerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  birthdate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormValues) => void;
  initialData?: Customer | null;
  title: string;
}

export function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}: CustomerFormProps) {
  // Initialize the form with default values or data for editing
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthdate: null,
      notes: "",
    },
  });

  // For the year-month picker
  const [date, setDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Separate state for UI display in dropdowns to ensure they update properly
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Refs for interval timers
  const monthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const yearIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Utility function to clear all intervals
  const clearAllIntervals = () => {
    if (monthIntervalRef.current) {
      clearInterval(monthIntervalRef.current);
      monthIntervalRef.current = null;
    }
    if (yearIntervalRef.current) {
      clearInterval(yearIntervalRef.current);
      yearIntervalRef.current = null;
    }
  };

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => clearAllIntervals();
  }, []);
  
  // Generate years for the dropdown (100 years back from current)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  // Month names for the dropdown
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Update form values when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const birthdate = initialData.birthdate ? new Date(initialData.birthdate) : null;
      
      form.reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone || "",
        birthdate: birthdate,
        notes: initialData.notes || "",
      });
      
      setDate(birthdate);
      
      // Update dropdown values if we have a birthdate
      if (birthdate) {
        setSelectedMonth(birthdate.getMonth().toString());
        setSelectedYear(birthdate.getFullYear().toString());
      }
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthdate: null,
        notes: "",
      });
      
      setDate(null);
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [initialData, form]);

  // Handle form submission
  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit(data);
    form.reset();
    setDate(null);
    setSelectedMonth("");
    setSelectedYear("");
  };
  
  // Handle year selection
  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    
    if (date) {
      const newDate = setYear(date, parseInt(year));
      setDate(newDate);
      form.setValue("birthdate", newDate);
    } else {
      // If no date is selected yet, create one with current month and day
      const now = new Date();
      const monthToUse = selectedMonth ? parseInt(selectedMonth) : now.getMonth();
      const newDate = new Date(parseInt(year), monthToUse, 1);
      setDate(newDate);
      form.setValue("birthdate", newDate);
    }
  };
  
  // Handle month selection
  const handleMonthSelect = (monthIndex: string) => {
    setSelectedMonth(monthIndex);
    
    if (date) {
      const newDate = setMonth(date, parseInt(monthIndex));
      setDate(newDate);
      form.setValue("birthdate", newDate);
    } else {
      // If no date is selected yet, create one with current year and day
      const now = new Date();
      const yearToUse = selectedYear ? parseInt(selectedYear) : now.getFullYear();
      const newDate = new Date(yearToUse, parseInt(monthIndex), 1);
      setDate(newDate);
      form.setValue("birthdate", newDate);
    }
  };
  
  // Change month up or down by one
  const changeMonth = (increment: boolean) => {
    let newMonthIndex: number;
    let newYearValue: number;
    
    // If no date is selected, use current date for reference
    if (!date) {
      const now = new Date();
      const baseMonthIndex = selectedMonth ? parseInt(selectedMonth) : now.getMonth();
      const baseYear = selectedYear ? parseInt(selectedYear) : now.getFullYear();
      
      if (increment) {
        newMonthIndex = baseMonthIndex === 11 ? 0 : baseMonthIndex + 1;
        newYearValue = baseMonthIndex === 11 ? baseYear + 1 : baseYear;
      } else {
        newMonthIndex = baseMonthIndex === 0 ? 11 : baseMonthIndex - 1;
        newYearValue = baseMonthIndex === 0 ? baseYear - 1 : baseYear;
      }
      
      const newDate = new Date(newYearValue, newMonthIndex, 1);
      setDate(newDate);
      setSelectedMonth(newMonthIndex.toString());
      setSelectedYear(newYearValue.toString());
      form.setValue("birthdate", newDate);
    } else {
      // Use the existing date
      const baseMonthIndex = date.getMonth();
      const baseYear = date.getFullYear();
      
      if (increment) {
        newMonthIndex = baseMonthIndex === 11 ? 0 : baseMonthIndex + 1;
        newYearValue = baseMonthIndex === 11 ? baseYear + 1 : baseYear;
      } else {
        newMonthIndex = baseMonthIndex === 0 ? 11 : baseMonthIndex - 1;
        newYearValue = baseMonthIndex === 0 ? baseYear - 1 : baseYear;
      }
      
      const newDate = new Date(date);
      newDate.setMonth(newMonthIndex);
      newDate.setFullYear(newYearValue);
      setDate(newDate);
      setSelectedMonth(newMonthIndex.toString());
      setSelectedYear(newYearValue.toString());
      form.setValue("birthdate", newDate);
    }
  };
  
  // Change year up or down by one
  const changeYear = (increment: boolean) => {
    let newYearValue: number;
    
    // If no date is selected, use current date for reference
    if (!date) {
      const now = new Date();
      const baseYear = selectedYear ? parseInt(selectedYear) : now.getFullYear();
      newYearValue = increment ? baseYear + 1 : baseYear - 1;
      
      const monthToUse = selectedMonth ? parseInt(selectedMonth) : now.getMonth();
      const newDate = new Date(newYearValue, monthToUse, 1);
      setDate(newDate);
      setSelectedYear(newYearValue.toString());
      form.setValue("birthdate", newDate);
    } else {
      // Use the existing date
      const baseYear = date.getFullYear();
      newYearValue = increment ? baseYear + 1 : baseYear - 1;
      
      const newDate = new Date(date);
      newDate.setFullYear(newYearValue);
      setDate(newDate);
      setSelectedYear(newYearValue.toString());
      form.setValue("birthdate", newDate);
    }
  };
  
  // Mouse down handlers for continuous scrolling
  const handleMonthMouseDown = (increment: boolean) => {
    // First immediate change
    changeMonth(increment);
    
    // Then start interval for continuous change
    const timer = setTimeout(() => {
      monthIntervalRef.current = setInterval(() => {
        changeMonth(increment);
      }, 100); // Fast scroll after initial delay
    }, 500); // Initial delay before fast scrolling starts
    
    monthIntervalRef.current = timer as unknown as NodeJS.Timeout;
  };
  
  const handleYearMouseDown = (increment: boolean) => {
    // First immediate change
    changeYear(increment);
    
    // Then start interval for continuous change
    const timer = setTimeout(() => {
      yearIntervalRef.current = setInterval(() => {
        changeYear(increment);
      }, 100); // Fast scroll after initial delay
    }, 500); // Initial delay before fast scrolling starts
    
    yearIntervalRef.current = timer as unknown as NodeJS.Timeout;
  };
  
  // Mouse up handler to clear intervals
  const handleMouseUp = () => {
    clearAllIntervals();
  };

  // Handle month navigation (left/right)
  const navigateMonth = (increment: boolean) => {
    const monthsToAdd = increment ? 1 : -1;
    
    if (date) {
      const newDate = addMonths(date, monthsToAdd);
      setDate(newDate);
      setSelectedMonth(newDate.getMonth().toString());
      setSelectedYear(newDate.getFullYear().toString());
      form.setValue("birthdate", form.getValues("birthdate")); // Preserve the selected day
    } else {
      const now = new Date();
      const baseMonth = selectedMonth ? parseInt(selectedMonth) : now.getMonth();
      const baseYear = selectedYear ? parseInt(selectedYear) : now.getFullYear();
      
      const newDate = new Date(baseYear, baseMonth, 1);
      const updatedDate = addMonths(newDate, monthsToAdd);
      
      setDate(updatedDate);
      setSelectedMonth(updatedDate.getMonth().toString());
      setSelectedYear(updatedDate.getFullYear().toString());
    }
  };

  // Update the month and year selection states when date changes directly from calendar
  useEffect(() => {
    if (date) {
      setSelectedMonth(date.getMonth().toString());
      setSelectedYear(date.getFullYear().toString());
    }
  }, [date]);  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader className="mb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edit customer information. Click save when you're done."
              : "Fill in the customer details. Required fields are marked with *"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 py-1 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birthdate</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b">
                        <div className="flex justify-between items-center gap-2">
                          {/* Month selector with dropdowns and buttons */}
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-medium mb-1">Month</div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={() => handleMonthMouseDown(false)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                aria-label="Previous month"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              
                              <Select 
                                value={selectedMonth}
                                onValueChange={handleMonthSelect}
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((month, index) => (
                                    <SelectItem key={month} value={index.toString()}>
                                      {month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={() => handleMonthMouseDown(true)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                aria-label="Next month"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Year selector with dropdowns and buttons */}
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-medium mb-1">Year</div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={() => handleYearMouseDown(false)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                aria-label="Previous year"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              
                              <Select 
                                value={selectedYear}
                                onValueChange={handleYearSelect}
                              >
                                <SelectTrigger className="w-[80px]">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="h-80">
                                  {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onMouseDown={() => handleYearMouseDown(true)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                aria-label="Next year"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                        <div className="h-[320px] overflow-y-auto pb-1"> {/* Increased height for better visibility of all dates */}
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              field.onChange(selectedDate);
                              setDate(selectedDate);
                              setSelectedMonth(selectedDate.getMonth().toString());
                              setSelectedYear(selectedDate.getFullYear().toString());
                            }
                            setCalendarOpen(false);
                          }}
                          initialFocus
                          month={date || undefined}
                          defaultMonth={field.value || undefined}
                          showOutsideDays={true}
                          className="rounded-md"
                          classNames={{
                            caption_label: "hidden", // Hides the built-in month/year caption
                            nav: "hidden", // Hides the built-in navigation (prev/next month)
                            table: "w-full border-collapse space-y-1",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative"
                          }}
                        />
                      </div>
                      
                      {/* Month navigation row - moved from above the calendar to below it */}
                      <div className="flex justify-between items-center p-2 border-t">
                        <Button 
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => navigateMonth(false)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="font-medium">
                          {date ? `${months[date.getMonth()]} ${date.getFullYear()}` : 'Select a date'}
                        </div>
                        
                        <Button 
                          variant="outline"
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => navigateMonth(true)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special notes or preferences"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}