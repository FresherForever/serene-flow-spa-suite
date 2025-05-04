import { useState, useEffect } from "react";
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
  DialogTitle
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, setYear, setMonth } from "date-fns";
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

  // Update the month and year selection states when date changes directly from calendar
  useEffect(() => {
    if (date) {
      setSelectedMonth(date.getMonth().toString());
      setSelectedYear(date.getFullYear().toString());
    }
  }, [date]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Edit customer information. Click save when you're done."
              : "Fill in the customer details. Required fields are marked with *"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                          <Select 
                            value={selectedMonth}
                            onValueChange={handleMonthSelect}
                          >
                            <SelectTrigger className="w-[120px]">
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
                          
                          <Select 
                            value={selectedYear}
                            onValueChange={handleYearSelect}
                          >
                            <SelectTrigger className="w-[90px]">
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
                        </div>
                      </div>
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
                        captionLayout="buttons-only"
                      />
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
            />
            <DialogFooter>
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