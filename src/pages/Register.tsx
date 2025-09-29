import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
  propertyNumber: z.string().trim().max(20, 'Property number must be less than 20 characters').optional(),
  streetName: z.string().trim().min(1, 'Street name is required').max(100, 'Street name must be less than 100 characters'),
  townCity: z.string().trim().min(1, 'Town/City is required').max(50, 'Town/City must be less than 50 characters'),
  county: z.string().trim().min(1, 'County is required').max(50, 'County must be less than 50 characters'),
  postcode: z.string().trim().min(1, 'Postcode is required').max(10, 'Postcode must be less than 10 characters'),
  homeTel: z.string().trim().max(20, 'Home telephone must be less than 20 characters').optional(),
  mobileTel: z.string().trim().max(20, 'Mobile telephone must be less than 20 characters').optional(),
  whatsappConsent: z.boolean().default(false),
  buildStyle: z.string().optional(),
  adviceToOthers: z.string().trim().max(1000, 'Advice must be less than 1000 characters').optional(),
  nhbcContact: z.boolean().optional(),
  socialMediaConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const buildStyles = [
  'Detached House',
  'Semi-Detached House', 
  'Terraced House',
  'Townhouse',
  'Apartment/Flat',
  'Bungalow',
  'Other'
];

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      whatsappConsent: false,
      nhbcContact: false,
      socialMediaConsent: false,
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    
    const { confirmPassword, ...registrationData } = data;
    
    const metadata = {
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      property_number: registrationData.propertyNumber || '',
      street_name: registrationData.streetName,
      town_city: registrationData.townCity,
      county: registrationData.county,
      postcode: registrationData.postcode,
      home_tel: registrationData.homeTel || '',
      mobile_tel: registrationData.mobileTel || '',
      whatsapp_consent: registrationData.whatsappConsent,
      build_style: registrationData.buildStyle || '',
      advice_to_others: registrationData.adviceToOthers || '',
      nhbc_contact: registrationData.nhbcContact || false,
      social_media_consent: registrationData.socialMediaConsent || false,
    };

    const { error } = await signUp(registrationData.email, registrationData.password, metadata);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Welcome! You have successfully registered.",
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join RedrowExposed</CardTitle>
            <CardDescription>
              Share your experience and help others make informed decisions about Barratt Redrow properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Number / Plot Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="streetName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street/Road Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="townCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Town/City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="homeTel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Tel</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobileTel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Tel</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="whatsappConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I would like to join the WhatsApp group
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Account Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose Password *</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Experience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Property Experience</h3>
                  <FormField
                    control={form.control}
                    name="buildStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What build style did you buy?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select build style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildStyles.map((style) => (
                              <SelectItem key={style} value={style}>
                                {style}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adviceToOthers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What advice would you give to others thinking about buying a Barratt Redrow property?</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[100px]" 
                            placeholder="Share your advice and experience..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nhbcContact"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Did you contact NHBC or any other redress scheme in relation to your experience?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === 'yes')}
                            value={field.value === true ? 'yes' : field.value === false ? 'no' : undefined}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="nhbc-yes" />
                              <Label htmlFor="nhbc-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="nhbc-no" />
                              <Label htmlFor="nhbc-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialMediaConsent"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>If you have left negative comments about your experience on Social Media, are you prepared to remove these comments in the event a positive outcome is achieved?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === 'yes')}
                            value={field.value === true ? 'yes' : field.value === false ? 'no' : undefined}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="social-yes" />
                              <Label htmlFor="social-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="social-no" />
                              <Label htmlFor="social-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}