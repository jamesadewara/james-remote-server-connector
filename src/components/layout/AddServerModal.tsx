"use client";

import { useState, useEffect } from 'react';
import { Server as ServerIcon, Clipboard, Loader2, Tag, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddServerFormData } from '@/types/server';
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddServerFormData) => Promise<void>; // Used for both Add and Update (generic submit)
  initialData?: AddServerFormData & { id?: string };
  isEditing?: boolean;
}

export const AddServerModal = ({ isOpen, onClose, onAdd, initialData, isEditing = false }: AddServerModalProps) => {
  const [loading, setLoading] = useState(false);
  const [replaceKey, setReplaceKey] = useState(false);
  const [formData, setFormData] = useState<AddServerFormData>({
    name: '',
    hostname: '',
    privateKey: '',
    username: 'root',
    sshPort: 22,
    description: '',
    tags: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData(prev => ({
          ...prev, // Keep existing edits if any (though usually we overwrite on open)
          ...initialData,
          hostname: initialData.hostname || initialData.ipAddress || '',
          privateKey: '', // Don't show existing key
          password: undefined,
          username: initialData.username || 'root',
          sshPort: initialData.sshPort || 22,
        }));
        setReplaceKey(false);
      } else if (!isEditing) {
        // Only reset if we are explicitly in "Add" mode
        setFormData({
          name: '',
          hostname: '',
          privateKey: '',
          password: undefined,
          username: 'root',
          sshPort: 22,
          description: '',
          tags: '',
        });
        setReplaceKey(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, initialData?.id]); // Only re-run if ID changes or modal opens/closes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const isPasswordAuth = formData.password !== undefined;

    // Only validate key if we are NOT using password AND (it's new OR we are replacing it)
    if (!isPasswordAuth) {
      const key = (formData.privateKey || '').trim();
      const isValidKey =
        key.includes('PRIVATE KEY-----') ||
        key.startsWith('ssh-rsa') ||
        key.startsWith('ssh-ed25519');

      if (!isEditing && !isValidKey) {
        toast.error("Invalid Private Key format. OpenSSH/PEM required.");
        return;
      }

      if (isEditing && replaceKey && !isValidKey) {
        toast.error("Invalid Private Key format.");
        return;
      }
    }

    setLoading(true);

    try {
      await onAdd(formData);

      toast.success(isEditing ? 'Server updated successfully' : 'Server added successfully');
      onClose();
    } catch (error: unknown) {
      console.error("Submit Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({ ...formData, privateKey: text });
      toast.success('Private key pasted from clipboard');
    } catch {
      toast.error('Failed to read clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ServerIcon className="w-5 h-5 text-primary" />
            {isEditing ? 'Edit Server' : 'Add New Server'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {isEditing
              ? "Update the details of your remote server below."
              : "Enter the details of your new remote server to start monitoring."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-muted-foreground">
                Server Name (Label)
              </Label>
              <Input
                id="name"
                placeholder="e.g., Production Web"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostname" className="text-sm text-muted-foreground">
                Connection Address (IP/Host)
              </Label>
              <Input
                id="hostname"
                placeholder="e.g., 192.168.1.100"
                value={formData.hostname || ''}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">
                SSH Username
              </Label>
              <Input
                id="username"
                placeholder="root"
                value={formData.username || 'root'}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                disabled={loading}
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
                value={formData.sshPort || 22}
                onChange={(e) => setFormData({ ...formData, sshPort: parseInt(e.target.value) || 22 })}
                className="bg-secondary border-border focus:border-primary focus:ring-primary"
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description (Optional)
            </Label>
            <Input
              id="description"
              placeholder="Short description..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary"
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-3 h-3" />
              Tags (Comma separated)
            </Label>
            <Input
              id="tags"
              placeholder="web, production, europe"
              value={formData.tags || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-secondary border-border focus:border-primary focus:ring-primary"
              disabled={loading}
            />
          </div>

          {/* Authentication Method */}
          <div className="space-y-4">
            <Label className="text-sm text-muted-foreground">Authentication Method</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="authKey"
                  checked={formData.password === undefined}
                  onCheckedChange={(c) => {
                    if (c) setFormData({ ...formData, privateKey: '', password: undefined });
                  }}
                  className="rounded-full"
                />
                <Label htmlFor="authKey" className="cursor-pointer">SSH Key</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="authPassword"
                  checked={formData.password !== undefined}
                  onCheckedChange={(c) => {
                    if (c) setFormData({ ...formData, password: '', privateKey: undefined });
                  }}
                  className="rounded-full"
                />
                <Label htmlFor="authPassword" className="cursor-pointer">Password</Label>
              </div>
            </div>
          </div>

          {/* Conditional Auth Input */}
          {formData.password === undefined ? (
            /* SSH Private Key */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="privateKey" className="text-sm text-muted-foreground">
                    SSH Private Key
                  </Label>
                  {isEditing && (
                    <div className="flex items-center gap-2 ml-4">
                      <Checkbox
                        id="replaceKey"
                        checked={replaceKey}
                        onCheckedChange={(c) => setReplaceKey(!!c)}
                      />
                      <label
                        htmlFor="replaceKey"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                      >
                        Update Key
                      </label>
                    </div>
                  )}
                </div>

                {(!isEditing || replaceKey) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteKey}
                    disabled={loading}
                    className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                  >
                    <Clipboard className="w-3 h-3 mr-1" />
                    Paste
                  </Button>
                )}
              </div>

              {(isEditing && !replaceKey) ? (
                <div className="h-[150px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex items-center justify-center italic">
                  <Key className="w-4 h-4 mr-2" />
                  Private Key is stored securely. Check &quot;Update Key&quot; to replace it.
                </div>
              ) : (
                <Textarea
                  id="privateKey"
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                  value={formData.privateKey}
                  onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                  className="bg-secondary border-border focus:border-primary focus:ring-primary font-mono text-xs min-h-[150px]"
                  required={!isEditing}
                  disabled={loading}
                />
              )}
            </div>
          ) : (
            /* Password Input */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  SSH Password
                </Label>
                {isEditing && (
                  <div className="flex items-center gap-2 ml-4">
                    <Checkbox
                      id="replaceKey"
                      checked={replaceKey}
                      onCheckedChange={(c) => setReplaceKey(!!c)}
                    />
                    <label
                      htmlFor="replaceKey"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                      Update Password
                    </label>
                  </div>
                )}
              </div>

              {(isEditing && !replaceKey) ? (
                <div className="h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground flex items-center italic">
                  <Key className="w-4 h-4 mr-2" />
                  Password stored securely.
                </div>
              ) : (
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-secondary border-border focus:border-primary focus:ring-primary"
                  required={!isEditing}
                  disabled={loading}
                />
              )}
            </div>
          )}


          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Server'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
