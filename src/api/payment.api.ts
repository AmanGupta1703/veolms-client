import api from "./axios";

export const createOrderApi = (courseId: string) =>
  api.post<{
    data: {
      orderId: string;
      amount: number;
      currency: string;
      razorpayKeyId: string;
    };
  }>("/payments/create-order", { courseId });

export const verifyPaymentApi = (data: {
  razorpayOrderId: string;
  razorPaymentId: string;
  razorpaySignature: string;
}) => api.post("/payments/verify", data);
