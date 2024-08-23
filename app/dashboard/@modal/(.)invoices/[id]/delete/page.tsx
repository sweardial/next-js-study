"use client";

import { Modal } from "@/app/ui/Modal";
import { useRouter } from "next/navigation";
import { deleteInvoice } from "../../../../../lib/actions";

export default function DeleteModal({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleDelete = async () => {
    // Implement your delete logic here
    const deleteInvoiceWithId = deleteInvoice.bind(null, params.id);

    await deleteInvoiceWithId();

    // After deletion, navigate back
    router.back();
  };

  return (
    <Modal>
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete invoice {params.id}?</p>
      <button onClick={handleDelete}>Yes, Delete</button>
      <button onClick={() => router.back()}>Cancel</button>
    </Modal>
  );
}
