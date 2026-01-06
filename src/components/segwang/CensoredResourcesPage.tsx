import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    Search,
    Key,
    MapPin,
    Stethoscope,
    Filter,
    ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CensoredResourcesPage() {
    const [activeTab, setActiveTab] = useState('equipment');

    // Helper to generate redacted string
    const r = (length: number) => "■".repeat(length);

    // Dummy censored data
    const censoredItems = Array(8).fill(null).map((_, i) => ({
        id: i,
        name: r(Math.floor(Math.random() * 4) + 3), // ■■■ to ■■■■■■
        type: r(2),
        description: r(Math.floor(Math.random() * 20) + 10),
    }));

    const censoredLocations = Array(4).fill(null).map((_, i) => ({
        id: i,
        name: r(Math.floor(Math.random() * 5) + 4),
        description: r(Math.floor(Math.random() * 15) + 15),
        time: r(11) // 00:00~00:00 -> ■■:■■~■■:■■
    }));

    return (
        <MainLayout>
            <div className="space-y-6 select-none cursor-not-allowed">
                <Tabs defaultValue="equipment" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full flex md:grid md:grid-cols-4 h-auto md:h-11 bg-white border border-border/60 rounded-sm p-1 gap-1 md:gap-0 opacity-80">
                        <TabsTrigger value="equipment" className="h-full gap-2 text-sm font-medium">
                            <Package className="w-4 h-4" />
                            {r(4)}
                        </TabsTrigger>
                        <TabsTrigger value="facilities" className="h-full gap-2 text-sm font-medium">
                            <MapPin className="w-4 h-4" />
                            {r(4)}
                        </TabsTrigger>
                        <TabsTrigger value="inspection" className="h-full gap-2 text-sm font-medium">
                            <Stethoscope className="w-4 h-4" />
                            {r(4)}
                        </TabsTrigger>
                        <TabsTrigger value="dormitory" disabled className="h-full gap-2 text-sm font-medium">
                            {r(3)}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="equipment" className="mt-4 space-y-8 pointer-events-none">
                        {/* Search Bar */}
                        <div className="relative opacity-60">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder={r(10)}
                                disabled
                                className="pl-12 h-11 text-base bg-white border-border/60 shadow-sm rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Rental Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Key className="w-6 h-6 text-primary fill-primary/20" />
                                        <h2 className="text-lg font-bold tracking-tight text-foreground">{r(4)}</h2>
                                    </div>
                                </div>

                                <div className="rounded-md border h-[400px] overflow-hidden relative bg-white opacity-80">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                            <TableRow>
                                                <TableHead className="w-[120px]">{r(2)}</TableHead>
                                                <TableHead className="w-[100px]">{r(2)}</TableHead>
                                                <TableHead>{r(2)}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {censoredItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>

                            {/* Supply Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="w-6 h-6 text-primary fill-primary/20" />
                                    <h2 className="text-lg font-bold tracking-tight text-foreground">{r(4)}</h2>
                                </div>

                                <div className="rounded-md border h-[400px] overflow-hidden relative bg-white opacity-80">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                            <TableRow>
                                                <TableHead className="w-[160px]">{r(2)}</TableHead>
                                                <TableHead>{r(2)}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {censoredItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </section>
                        </div>
                    </TabsContent>

                    <TabsContent value="facilities" className="mt-8 pointer-events-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {censoredLocations.map((location) => (
                                <div
                                    key={location.id}
                                    className="group overflow-hidden bg-white border border-border rounded-lg opacity-80"
                                >
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                </div>
                                                <h3 className="font-bold text-lg">{location.name}</h3>
                                            </div>
                                            <Badge variant="outline" className="text-xs border-destructive text-destructive bg-destructive/5 shrink-0">
                                                {r(4)}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{location.description}</p>
                                        </div>
                                        <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                                            {location.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="inspection" className="mt-8 space-y-3.5 pointer-events-none">
                        <div className="flex flex-col gap-3 bg-muted/20 p-4 rounded-lg border border-border/40 opacity-80">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">{r(6)}</h2>
                                <p className="text-sm text-muted-foreground">{r(20)}</p>
                            </div>
                            <Button disabled className="w-full sm:w-auto h-9">
                                {r(5)}
                            </Button>
                        </div>

                        <Card className="border border-border/60 shadow-sm bg-white overflow-hidden min-h-[400px] opacity-80">
                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                                    <ClipboardCheck className="w-10 h-10 text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground">{r(10)}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {r(15)}<br />
                                        {r(20)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}
