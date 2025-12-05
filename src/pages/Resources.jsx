import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ResourceBar } from '@/components/dashboard/ResourceBar';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { AddResourceModal } from '@/components/modals/AddResourceModal';
import { deleteResource } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Activity, ArrowRight, PlusCircle } from 'lucide-react';

const Resources = () => {
  const { data, loading } = useRealtimeData();
  const [showAddModal, setShowAddModal] = useState(false);

  const resources = data.resources || [];
  const resourceStats = data.resourceStats || {
    unitsDeployed: 0,
    activeLocations: 0,
    efficiencyScore: 0,
    pendingTransfers: 0
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(id);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

  if (loading) {
    return (
      <MainLayout title="Resource Management" subtitle="Track and allocate emergency resources">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        title="Resource Management"
        subtitle="Track and allocate emergency resources"
        actions={
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Resource
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {resources.map(resource => (
            <ResourceBar key={resource.id} resource={resource} onDelete={handleDelete} />
          ))}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Resource Optimizer</h3>
              <p className="text-sm text-muted-foreground mt-1">Automatically allocate resources based on predicted needs</p>
            </div>
            <Button variant="outline">Run Optimization</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{resourceStats.unitsDeployed}</p>
              <p className="text-sm text-muted-foreground">Units deployed</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{resourceStats.activeLocations}</p>
              <p className="text-sm text-muted-foreground">Active locations</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-success">{resourceStats.efficiencyScore?.toFixed(0) || 0}%</p>
              <p className="text-sm text-muted-foreground">Efficiency score</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-warning">{resourceStats.pendingTransfers}</p>
              <p className="text-sm text-muted-foreground">Pending transfers</p>
            </div>
          </div>
        </div>
      </MainLayout>

      <AddResourceModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  );
};

export default Resources;