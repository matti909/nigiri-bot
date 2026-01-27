import { useEffect } from "react";
import { addOrder, fetchOrders } from "../store/features/ordersSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";
import { calculateTotal } from "../utils";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  error?: string;
  order: OrderItem[] | null;
  handleReset?: () => void;
  orderCreatedTrigger?: number;
};

export const Orders = ({
  order,
  error,
  handleReset,
  orderCreatedTrigger,
}: Props) => {
  const { orderList, loading, error2 } = useAppSelector(
    (state) => state.employeeKey
  );
  const dispatch = useAppDispatch();

  // Fetch inicial al montar
  useEffect(() => {
    dispatch(fetchOrders()).unwrap();
  }, [dispatch]);

  // Refetch cuando el LLM cree un pedido
  useEffect(() => {
    if (orderCreatedTrigger && orderCreatedTrigger > 0) {
      dispatch(fetchOrders()).unwrap();
    }
  }, [orderCreatedTrigger, dispatch]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order || order.length === 0) {
      console.error("No hay un pedido válido para enviar.");
      return;
    }

    try {
      await dispatch(addOrder(order)).unwrap();
      console.log("Pedido enviado exitosamente.");

      // Limpiar el pedido actual
      if (handleReset) {
        handleReset();
      }

      // Refrescar la lista de pedidos
      dispatch(fetchOrders());
    } catch (err) {
      console.error("Error al enviar el pedido:", err);
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Pedido Actual */}
      {order?.length ? (
        <div className="p-5 rounded-xl border border-border bg-background shadow-lg">
          <h3 className="text-xl font-bold text-sushi-paper mb-4">
            📋 Pedido Actual
          </h3>
          <ul className="space-y-3 text-sushi-text">
            {order.map((item, index) => (
              <li key={index} className="flex flex-col gap-1 pb-3 border-b border-zinc-700 last:border-0">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sushi-accent font-bold">
                    ${(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
                <div className="text-sm text-muted">
                  x{item.quantity} × ${item.price.toFixed(0)} c/u
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <div className="flex justify-between items-center text-lg font-bold text-sushi-paper">
              <span>Total:</span>
              <span className="text-sushi-accent">
                ${calculateTotal(order).toFixed(0)}
              </span>
            </div>
          </div>
          <button
            onClick={handleOrderSubmit}
            className={`w-full px-4 py-3 mt-4 text-white font-medium rounded-xl transition-all shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-sushi-accent hover:bg-sushi-accent/90 hover:shadow-lg active:scale-95"
            }`}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Confirmar Pedido"}
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-center text-muted">
          <p className="text-sm">Sin pedido pendiente</p>
        </div>
      )}

      {/* Historial de Pedidos */}
      <div className="p-5 rounded-xl border border-border bg-sushi-bg shadow-lg overflow-hidden">
        {error2 && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
            {error2}
          </div>
        )}

        <h3 className="text-xl font-bold text-sushi-paper mb-4">
          📦 Historial de Pedidos
        </h3>

        {orderList?.length ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {orderList.map((order, index) => (
              <div
                key={index}
                className="p-4 space-y-3 rounded-lg shadow-sm bg-sushi-paper border border-zinc-700"
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 text-xs font-bold uppercase bg-sushi-accent/20 text-sushi-accent rounded">
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
                </div>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm text-sushi-muted"
                    >
                      <span>{item.details.name} x{item.quantity}</span>
                      <span className="font-medium">${item.details.price.toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted">
            <p className="text-sm">No hay pedidos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};
