import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportDisaster } from '@/services/api';
import { Loader2 } from 'lucide-react';

export function ReportDisasterModal({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'flood',
        title: '',
        description: '',
        location: '',
        severity: 'medium',
        reportedBy: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await reportDisaster({
                type: formData.type,
                title: formData.title,
                description: formData.description,
                location: formData.location,
                severity: formData.severity,
                reportedBy: formData.reportedBy || 'Anonymous',
                coordinates: { lat: 0, lng: 0 }, // In a real app, use geocoding
            });

            // Reset form
            setFormData({
                type: 'flood',
                title: '',
                description: '',
                location: '',
                severity: 'medium',
                reportedBy: '',
            });

            onOpenChange(false);
            alert('Disaster report submitted successfully!');
        } catch (error) {
            console.error('Failed to report disaster:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Report Disaster</DialogTitle>
                    <DialogDescription>
                        Report a disaster incident to alert emergency response teams
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Disaster Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="earthquake">Earthquake</SelectItem>
                                <SelectItem value="flood">Flood</SelectItem>
                                <SelectItem value="hurricane">Hurricane</SelectItem>
                                <SelectItem value="wildfire">Wildfire</SelectItem>
                                <SelectItem value="tsunami">Tsunami</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Flash Flood in Downtown"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what you're observing..."
                            required
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., 123 Main St, City, State"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="severity">Severity</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value) => setFormData({ ...formData, severity: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Moderate</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reportedBy">Your Name (Optional)</Label>
                            <Input
                                id="reportedBy"
                                value={formData.reportedBy}
                                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                                placeholder="Anonymous"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-destructive hover:bg-destructive/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Report
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
