import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const addLicenseSchema = z.object({
  type: z.string().min(1, "Please select a license type"),
  licenseKeys: z.string().min(1, "Please enter at least one license key"),
  price: z.string().min(1, "Please enter a price").regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price")
});

type AddLicenseForm = z.infer<typeof addLicenseSchema>;

const LICENSE_TYPES = [
  "ASTER Pro-2",
  "ASTER Pro-3", 
  "ASTER Pro-6",
  "ASTER Annual-2",
  "ASTER Annual-3",
  "ASTER Annual-6"
];

interface AddLicenseModalProps {
  trigger?: React.ReactNode;
}

export function AddLicenseModal({ trigger }: AddLicenseModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AddLicenseForm>({
    resolver: zodResolver(addLicenseSchema)
  });

  const selectedType = watch("type");

  const addLicensesMutation = useMutation({
    mutationFn: async (data: AddLicenseForm) => {
      const licenseKeys = data.licenseKeys
        .split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0);

      return apiRequest("POST", "/api/licenses", {
        type: data.type,
        licenseKeys,
        price: data.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Licenses added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add licenses",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AddLicenseForm) => {
    addLicensesMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add License
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Add New License</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-slate-700">License Type</Label>
            <Select onValueChange={(value) => setValue("type", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select license type" />
              </SelectTrigger>
              <SelectContent>
                {LICENSE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="licenseKeys" className="text-sm font-medium text-slate-700">License Keys</Label>
            <Textarea
              {...register("licenseKeys")}
              className="mt-2 h-32"
              placeholder="Enter license keys (one per line)&#10;ASTER-PRO2-ABC123&#10;ASTER-PRO2-DEF456&#10;ASTER-PRO2-GHI789"
            />
            <p className="text-xs text-slate-500 mt-1">Enter one license key per line</p>
            {errors.licenseKeys && (
              <p className="text-sm text-red-600 mt-1">{errors.licenseKeys.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium text-slate-700">Price ($)</Label>
            <Input
              {...register("price")}
              type="number"
              step="0.01"
              className="mt-2"
              placeholder="299"
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={addLicensesMutation.isPending}
            >
              {addLicensesMutation.isPending ? "Adding..." : "Add Licenses"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
