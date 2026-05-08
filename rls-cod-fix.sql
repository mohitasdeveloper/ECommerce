-- ==========================================
-- UPDATE ROW LEVEL SECURITY FOR COD SUPPORT
-- ==========================================

-- The frontend needs permission to securely insert order items for Cash on Delivery.
-- Add an INSERT policy for the order_items table.
-- It ensures that a user can only insert items for an order they own.

create policy "Users insert own order items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
