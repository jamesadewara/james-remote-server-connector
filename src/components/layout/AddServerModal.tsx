"use client";

import { useState } from 'react';
import { Server, X, Info, Clipboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddServerFormData } from '@/types/server';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddServerFormData) => void;
}

export const AddServerModal = ({ isOpen, onClose, onAdd }: AddServerModalProps) => {
  const [formData, setFormData] = useState<AddServerFormData>({
    name: '',
    hostname: '',
    ipAddress: '',
    sshPort: 22,
    username: 'root',
    privateKey: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', hostname: '', ipAddress: '', sshPort: 22, username: 'root', privateKey: '' });
    onClose();
  };

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({ ...formData, privateKey: text });
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Server className="w-5 h-5 text-primary" />
            Add New Server
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="ipAddress" className="text-sm text-muted-foreground">
                IP / Hostname
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">
                SSH Username
              </Label>
              <Input
                id="username"
                placeholder="root"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sshPort" className="text-sm text-muted-foreground">
                SSH Port
              </Label>
              <Input
                id="sshPort"
                type="number"
                placeholder="22"
                value={formData.sshPort}
                onChange={(e) => setFormData({ ...formData, sshPort: parseInt(e.target.value) || 22 })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="privateKey" className="text-sm text-muted-foreground">
                  SSH Private Key
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>You must add your Public Key to the remote server’s ~/.ssh/authorized_keys file for this to work.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePasteKey}
                className="h-6 px-2 text-xs text-primary hover:text-primary/80"
              >
                <Clipboard className="w-3 h-3 mr-1" />
                Paste
              </Button>
            </div>
            <Textarea
              id="privateKey"
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
              value={formData.privateKey}
              onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary font-mono text-xs min-h-[150px]"
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
