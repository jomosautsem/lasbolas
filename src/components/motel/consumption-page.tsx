'use client';

import { useState, useMemo } from 'react';
import type { Product, Room } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, X, Beer, UtensilsCrossed, GlassWater, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ProductFormModal from './product-form-modal';
import DeleteProductDialog from './delete-product-dialog';


interface ConsumptionPageProps {
  products: Product[];
  occupiedRooms: Room[];
  onConfirm: (roomId: number, items: (Product & { quantity: number })[], totalPrice: number) => void;
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

type CartItem = Product & { quantity: number };

const categoryIcons: { [key: string]: React.ElementType } = {
  Bebida: Beer,
  Snack: UtensilsCrossed,
  Cocina: UtensilsCrossed,
  Otro: GlassWater,
};

export default function ConsumptionPage({ products, occupiedRooms, onConfirm, onAddProduct, onUpdateProduct, onDeleteProduct }: ConsumptionPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleQuantityChange = (product: Product, change: number) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity > 0) {
          return currentCart.map(item =>
            item.id === product.id ? { ...item, quantity: newQuantity } : item
          );
        } else {
          return currentCart.filter(item => item.id !== product.id);
        }
      } else if (change > 0) {
        return [...currentCart, { ...product, quantity: 1 }];
      }
      return currentCart;
    });
  };
  
  const handleRemoveFromCart = (productId: number) => {
      setCart(currentCart => currentCart.filter(item => item.id !== productId));
  }

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const handleConfirmConsumption = () => {
    if (!selectedRoomId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione una habitación.' });
      return;
    }
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'El carrito está vacío.' });
      return;
    }

    onConfirm(parseInt(selectedRoomId, 10), cart, totalPrice);
    
    toast({
      title: 'Consumo Agregado',
      description: `Se cargaron $${totalPrice.toFixed(2)} a la habitación seleccionada.`,
    });

    setCart([]);
    setSelectedRoomId('');
  };
  
  const getProductQuantity = (productId: number) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  }

  // From ProductsPage
  const handleOpenFormModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedProduct) {
      onDeleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleFormSubmit = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setIsFormModalOpen(false);
  };


  return (
    <>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <Tabs defaultValue="consumption" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consumption">Registrar Consumo</TabsTrigger>
          <TabsTrigger value="products">Gestionar Productos</TabsTrigger>
        </TabsList>
        <TabsContent value="consumption">
            <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
                <CardHeader>
                <CardTitle>Menú de Alimentos y Bebidas</CardTitle>
                <CardDescription>Seleccione productos para agregar al consumo de una habitación.</CardDescription>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                    {products.map(product => {
                        const Icon = categoryIcons[product.category] || UtensilsCrossed;
                        const quantity = getProductQuantity(product.id);
                        return (
                        <Card key={product.id} className="flex flex-col">
                            <CardHeader className="p-3">
                            <Icon className="h-8 w-8 text-muted-foreground mx-auto" />
                            </CardHeader>
                            <CardContent className="p-3 flex-grow text-center">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                            </CardContent>
                            <CardFooter className="p-2 bg-muted/50 flex justify-center items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleQuantityChange(product, -1)} disabled={quantity === 0}>
                                <Minus className="h-4 w-4"/>
                            </Button>
                            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleQuantityChange(product, 1)}>
                                <Plus className="h-4 w-4"/>
                            </Button>
                            </CardFooter>
                        </Card>
                        );
                    })}
                    </div>
                </ScrollArea>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 flex flex-col">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart /> Pedido Actual</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                    <label className="text-sm font-medium mb-2 block">Habitación de Destino</label>
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione una habitación..." />
                        </SelectTrigger>
                        <SelectContent>
                        {occupiedRooms.length > 0 ? (
                            occupiedRooms.map(room => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                                {room.name}
                            </SelectItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">No hay habitaciones ocupadas.</div>
                        )}
                        </SelectContent>
                    </Select>
                    </div>
                    <Separator />
                    <ScrollArea className="h-64">
                        <div className="space-y-2 pr-4">
                        {cart.length > 0 ? (
                            cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromCart(item.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-16">El carrito está vacío</div>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-4 border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button onClick={handleConfirmConsumption} disabled={cart.length === 0 || !selectedRoomId}>
                        Confirmar y Cargar a Habitación
                    </Button>
                </CardFooter>
            </Card>
            </div>
        </TabsContent>
        <TabsContent value="products">
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Gestión de Productos</CardTitle>
                    <CardDescription>Crea, edita y elimina alimentos y bebidas del menú.</CardDescription>
                </div>
                <Button onClick={() => handleOpenFormModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Producto
                </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length > 0 ? (
                    products.map((product) => (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenFormModal(product)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(product)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                        No hay productos registrados.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
    <ProductFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onConfirm={handleFormSubmit}
        productToEdit={selectedProduct}
    />
    <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        productName={selectedProduct?.name || ''}
    />
    </>
  );
}
