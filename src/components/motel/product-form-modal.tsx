'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Package, PackagePlus, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductCategory } from '@/lib/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: Omit<Product, 'id'> | Product) => void;
  productToEdit?: Product | null;
}

const categories: ProductCategory[] = ['Bebida', 'Snack', 'Cocina', 'Otro'];

export default function ProductFormModal({ isOpen, onOpenChange, onConfirm, productToEdit }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [category, setCategory] = useState<ProductCategory>('Otro');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price);
        setStock(productToEdit.stock);
        setCategory(productToEdit.category);
      } else {
        setName('');
        setPrice('');
        setStock('');
        setCategory('Otro');
      }
    }
  }, [isOpen, productToEdit]);

  const handleConfirmClick = () => {
    if (!name.trim() || !category || price === '' || price <= 0 || stock === '' || stock < 0) {
      toast({
        variant: 'destructive',
        title: 'Datos Incompletos',
        description: 'Por favor, complete todos los campos correctamente.',
      });
      return;
    }

    const productData = {
      name,
      price: +price,
      stock: +stock,
      category,
    };
    
    if (productToEdit) {
      onConfirm({ ...productData, id: productToEdit.id });
    } else {
      onConfirm(productData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <PackagePlus className="h-6 w-6 text-primary" />
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {productToEdit ? 'Modifique los detalles del producto.' : 'Ingrese los detalles del nuevo producto.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
               <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  className="pl-9"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={(value: ProductCategory) => setCategory(value)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Guardar Producto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
