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
};

export const Orders = ({ order, error, handleReset }: Props) => {
  const { orderList, loading, error2 } = useAppSelector(
    (state) => state.employeeKey
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOrders()).unwrap();
  }, [dispatch]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order || order.length === 0) {
      console.error("No hay un pedido válido para enviar.");
      return;
    }

    try {
      await dispatch(addOrder(order)).unwrap();
      console.log("Pedido enviado y estado reiniciado.");
      if (handleReset) {
        handleReset();
      }
    } catch (err) {
      console.error("Error al enviar el pedido:", err);
    }
  };

  return (
    <div className="mt-6 w-full max-w-md">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {order?.length ? (
        <div className="p-4 mt-16 rounded-lg border border-border bg-background">
          <h3 className="text-lg font-bold text-sushi-paper">
            Detalles del Pedido
          </h3>
          <ul className="mt-2 space-y-2 text-sushi-text">
            {order.map((item, index) => (
              <li key={index}>
                - {item.name} (x{item.quantity}): $
                {(item.price * item.quantity).toFixed(2)} ($
                {item.price.toFixed(2)} c/u)
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-sushi-paper">
            Total: ${calculateTotal(order).toFixed(2)}
          </p>
          <button
            onClick={handleOrderSubmit}
            className={`px-4 py-2 mt-4 text-white rounded-lg transition 
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sushi-accent hover:bg-sushi-accent/90"
            }
          `}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Pedido"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No hay ordenes!.</p>
      )}

      {/* section order success */}
      <section className="p-4 mt-4 rounded-lg border border-border bg-sushi-bg">
        {error2 && <p className="text-sm text-red-500">{error2}</p>}
        {orderList?.length ? (
          <div className="mt-2 space-y-4">
            <h3 className="text-lg font-bold text-sushi-paper">
              Pedidos pendientes
            </h3>
            {orderList.map((order, index) => (
              <div
                key={index}
                className="flex flex-col p-4 space-y-2 rounded-lg shadow-md bg-sushi-paper"
              >
                <div className="flex flex-col justify-between items-center">
                  <span className="font-bold text-sushi-accent">
                    {order.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Orden: #{order.id}
                  </span>
                </div>
                <ul className="space-y-2 text-sushi-text">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sushi-muted"
                    >
                      <span>{item.details.name}</span>
                      <span>${item.details.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {/* <p className="font-bold text-sushi-paper">
                  Total: ${calculateTotal(order.items).toFixed(2)}
                </p> */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay órdenes disponibles.</p>
        )}
      </section>
    </div>
  );
};
