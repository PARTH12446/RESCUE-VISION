import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addResource } from '@/services/api';
import { Loader2 } from 'lucide-react';

export function AddResourceModal({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'medical',
        name: '',
        quantity: '',
        available: '',
        location: '',
        status: 'available',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addResource({
                type: formData.type,
                name: formData.name,
                quantity: parseInt(formData.quantity),
                available: parseInt(formData.available),
                location: formData.location,
                status: formData.status,
            });

            // Reset form
            setFormData({
                type: 'medical',
                name: '',
                quantity: '',
                available: '',
                location: '',
                status: 'available',
            });

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add resource:', error);
            alert('Failed to add resource. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>
                        Add a new resource to the inventory system
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Resource Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="food">Food & Water</SelectItem>
                                <SelectItem value="shelter">Shelter</SelectItem>
                                <SelectItem value="rescue">Rescue Equipment</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Resource Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Emergency Medical Kits"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Total Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="100"
                                required
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="available">Available</Label>
                            <Input
                                id="available"
                                type="number"
                                value={formData.available}
                                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                                placeholder="50"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Regional Hub A"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="deployed">Deployed</SelectItem>
                                <SelectItem value="in-transit">In Transit</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
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
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Resource
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
