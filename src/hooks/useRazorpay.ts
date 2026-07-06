import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { createOrderApi, verifyPaymentApi } from "../api/payment.api";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const initiatePayment = async (courseId: string, courseTitle: string) => {
    try {
      const {
        data: { data },
      } = await createOrderApi(courseId);

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: "VeoLMS",
        description: courseTitle,
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyPaymentApi({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          navigate("/dashboard");
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled by user");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment failed:", err);
      throw err;
    }
  };

  return { initiatePayment };
};
