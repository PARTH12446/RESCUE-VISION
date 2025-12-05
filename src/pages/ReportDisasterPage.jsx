import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, AlertTriangle, Camera, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { fetchIndiaRisk } from '@/services/api';

export function ReportDisasterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indiaRisk, setIndiaRisk] = useState(null);
  const [indiaRiskLoading, setIndiaRiskLoading] = useState(false);
  const [indiaRiskError, setIndiaRiskError] = useState(null);

  const [report, setReport] = useState({
    type: undefined,
    title: '',
    description: '',
    location: '',
    coordinates: { lat: 0, lng: 0 },
    severity: 'moderate',
    images: [],
    status: 'reported',
  });

  const handleInputChange = (field, value) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (lat, lng, address) => {
    setReport(prev => ({
      ...prev,
      coordinates: { lat, lng },
      location: address
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setReport(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
  };

  const removeImage = (index) => {
    setReport(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting report:', {
        ...report,
        timestamp: new Date().toISOString()
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Emergency services have been notified.",
      });
      
      navigate('/map');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIndiaRiskForArea = () => {
    const { lat, lng } = report.coordinates || {};

    if (!lat || !lng) {
      setIndiaRiskError('Set the incident location on the map or address to see India risk for this area.');
      return;
    }

    setIndiaRiskLoading(true);
    setIndiaRiskError(null);

    fetchIndiaRisk({ lat, lon: lng })
      .then((risk) => {
        setIndiaRisk(risk);
      })
      .catch((err) => {
        setIndiaRiskError(err instanceof Error ? err.message : 'Failed to fetch India risk for this area');
      })
      .finally(() => {
        setIndiaRiskLoading(false);
      });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Report a Disaster</h1>
          <p className="text-muted-foreground">
            Help emergency services respond faster by reporting disasters in your area
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -z-10"></div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                  currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {step}
                </div>
                <span className="text-sm">
                  {step === 1 ? 'Details' : step === 2 ? 'Location' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {currentStep === 1 && 'Incident Details'}
                {currentStep === 2 && 'Location Information'}
                {currentStep === 3 && 'Review & Submit'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Disaster Type *</Label>
                      <Select 
                        value={report.type} 
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select disaster type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="earthquake">Earthquake</SelectItem>
                          <SelectItem value="flood">Flood</SelectItem>
                          <SelectItem value="hurricane">Hurricane</SelectItem>
                          <SelectItem value="wildfire">Wildfire</SelectItem>
                          <SelectItem value="tsunami">Tsunami</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity *</Label>
                      <Select 
                        value={report.severity} 
                        onValueChange={(value) => 
                          handleInputChange('severity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Brief Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="E.g., Major flooding in downtown area" 
                      value={report.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Please provide as much detail as possible..." 
                      rows={4}
                      value={report.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Photos (Optional)</Label>
                    <div className="flex flex-wrap gap-4">
                      {report.images?.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Disaster ${index + 1}`} 
                            className="h-24 w-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="h-24 w-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center">Add Photo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Map integration will go here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.location || 'Click on the map to select location'}
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          handleLocationSelect(
                            37.7749 + (Math.random() - 0.5) * 0.1, 
                            -122.4194 + (Math.random() - 0.5) * 0.1,
                            'San Francisco, CA'
                          );
                        }}
                      >
                        Select on Map
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Address *</Label>
                    <Input 
                      id="location" 
                      placeholder="Enter address or click on the map" 
                      value={report.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">Current India risk in this area</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="h-7 px-2 text-[11px]"
                        onClick={handleCheckIndiaRiskForArea}
                        disabled={indiaRiskLoading}
                      >
                        {indiaRiskLoading ? 'Checking...' : 'Check risk'}
                      </Button>
                    </div>
                    {indiaRiskError && (
                      <p className="text-xs text-destructive">{indiaRiskError}</p>
                    )}
                    {indiaRisk && !indiaRiskLoading && (
                      <div className="text-xs space-y-1">
                        <p className="text-foreground font-medium">{indiaRisk.location}</p>
                        <p className="text-muted-foreground capitalize">
                          {indiaRisk.type}  • {indiaRisk.severity}
                        </p>
                        <p className="text-muted-foreground">
                          {(indiaRisk.probability * 100).toFixed(1)}%  • {indiaRisk.riskScore.toFixed(1)}/10
                        </p>
                      </div>
                    )}
                    {!indiaRisk && !indiaRiskLoading && !indiaRiskError && (
                      <p className="text-xs text-muted-foreground">
                        Use India risk for this location to prioritize which citizen reports to triage first.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Incident Details</h3>
                    <div className="bg-muted/50 p-4 rounded-md space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="capitalize">{report.type || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Severity</p>
                          <p className="capitalize">{report.severity}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Title</p>
                          <p>{report.title || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p>{report.description || 'No description provided'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p>{report.location || 'No location specified'}</p>
                        </div>
                      </div>
                      
                      {report.images && report.images.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Photos</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {report.images.map((img, index) => (
                              <img 
                                key={index} 
                                src={img} 
                                alt={`Disaster ${index + 1}`} 
                                className="h-20 w-20 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-warning">Important</h4>
                        <p className="text-sm text-warning/90">
                          Only report real emergencies. False reports may be subject to legal action.
                          In case of immediate danger, please contact local emergency services.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <div className="border-t px-6 py-4 bg-muted/20">
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && (!report.type || !report.title || !report.description)) ||
                      (currentStep === 2 && !report.location)
                    }
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={
                      !report.type || 
                      !report.title || 
                      !report.description || 
                      !report.location ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>For immediate assistance, please contact emergency services at 911 (US) or your local emergency number.</p>
        </div>
      </div>
    </div>
  );
}