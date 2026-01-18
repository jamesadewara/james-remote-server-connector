import { useState } from 'react';
import { Server, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; hostname: string; ipAddress: string }) => void;
}

export const AddServerModal = ({ isOpen, onClose, onAdd }: AddServerModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    ipAddress: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', hostname: '', ipAddress: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Server className="w-5 h-5 text-primary" />
            Add New Server
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Server Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Production Web"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostname" className="text-sm text-muted-foreground">
              Hostname
            </Label>
            <Input
              id="hostname"
              placeholder="e.g., prod-web-01"
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress" className="text-sm text-muted-foreground">
              IP Address
            </Label>
            <Input
              id="ipAddress"
              placeholder="e.g., 192.168.1.100"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Server
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
