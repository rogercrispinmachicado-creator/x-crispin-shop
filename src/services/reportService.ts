import { storage } from './storage';

export interface SalesReportMetrics {
  totalVentas: number;
  totalPedidos: number;
  ticketPromedio: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  ventasPorDepartamento: { departamento: string; monto: number; cantidad: number }[];
  ventasPorCategoria: { categoria: string; monto: number; cantidad: number }[];
  productosMasVendidos: { nombre: string; sku: string; unidades: number; totalBs: number }[];
  ventasPorMetodoPago: { metodo: string; totalBs: number; cantidad: number }[];
}

export const reportService = {
  getMetrics: (): SalesReportMetrics => {
    const orders = storage.getOrders();
    const confirmedOrders = orders.filter(
      (o) => o.estadoPago === 'CONFIRMADO' || o.estado === 'ENTREGADO' || o.estado === 'ENVIADO'
    );

    const totalVentas = confirmedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPedidos = orders.length;
    const ticketPromedio = confirmedOrders.length ? Math.round(totalVentas / confirmedOrders.length) : 0;
    const pedidosPendientes = orders.filter((o) => o.estado === 'PAGO_PENDIENTE' || o.estado === 'PAGO_EN_REVISION').length;
    const pedidosEntregados = orders.filter((o) => o.estado === 'ENTREGADO').length;

    // By Department
    const deptMap: Record<string, { monto: number; cantidad: number }> = {};
    orders.forEach((o) => {
      const dep = o.departamento || 'No especificado';
      if (!deptMap[dep]) deptMap[dep] = { monto: 0, cantidad: 0 };
      deptMap[dep].monto += o.total;
      deptMap[dep].cantidad += 1;
    });
    const ventasPorDepartamento = Object.entries(deptMap)
      .map(([departamento, val]) => ({ departamento, monto: val.monto, cantidad: val.cantidad }))
      .sort((a, b) => b.monto - a.monto);

    // By Category & Top products
    const prodMap: Record<string, { nombre: string; sku: string; unidades: number; totalBs: number }> = {};
    const catMap: Record<string, { monto: number; cantidad: number }> = {};
    const products = storage.getProducts();

    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (!prodMap[it.productoId]) {
          prodMap[it.productoId] = { nombre: it.nombre, sku: it.sku, unidades: 0, totalBs: 0 };
        }
        prodMap[it.productoId].unidades += it.cantidad;
        prodMap[it.productoId].totalBs += it.subtotal;

        const prod = products.find((p) => p.id === it.productoId);
        const cat = prod ? prod.categoriaNombre : 'General';
        if (!catMap[cat]) catMap[cat] = { monto: 0, cantidad: 0 };
        catMap[cat].monto += it.subtotal;
        catMap[cat].cantidad += it.cantidad;
      });
    });

    const productosMasVendidos = Object.values(prodMap).sort((a, b) => b.unidades - a.unidades);
    const ventasPorCategoria = Object.entries(catMap)
      .map(([categoria, val]) => ({ categoria, monto: val.monto, cantidad: val.cantidad }))
      .sort((a, b) => b.monto - a.monto);

    // By Payment method
    const payMap: Record<string, { totalBs: number; cantidad: number }> = {};
    orders.forEach((o) => {
      const met = o.metodoPago.replace(/_/g, ' ');
      if (!payMap[met]) payMap[met] = { totalBs: 0, cantidad: 0 };
      payMap[met].totalBs += o.total;
      payMap[met].cantidad += 1;
    });
    const ventasPorMetodoPago = Object.entries(payMap).map(([metodo, val]) => ({
      metodo,
      totalBs: val.totalBs,
      cantidad: val.cantidad,
    }));

    return {
      totalVentas,
      totalPedidos,
      ticketPromedio,
      pedidosPendientes,
      pedidosEntregados,
      ventasPorDepartamento,
      ventasPorCategoria,
      productosMasVendidos,
      ventasPorMetodoPago,
    };
  },

  exportOrdersToCsv: (): void => {
    const orders = storage.getOrders();
    const headers = [
      'Numero_Pedido',
      'Fecha',
      'Cliente',
      'Telefono',
      'Departamento',
      'Ciudad',
      'Metodo_Pago',
      'Estado_Pago',
      'Estado_Pedido',
      'Subtotal_Bs',
      'Descuento_Bs',
      'Envio_Bs',
      'Total_Bs',
    ];

    const rows = orders.map((o) => [
      o.numeroPedido,
      o.createdAt.substring(0, 10),
      `"${o.clienteNombre} ${o.clienteApellido}"`,
      o.clienteTelefono,
      o.departamento,
      o.ciudad,
      o.metodoPago,
      o.estadoPago,
      o.estado,
      o.subtotal,
      o.descuentoCupon,
      o.costoEnvio,
      o.total,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_xcrispin_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
