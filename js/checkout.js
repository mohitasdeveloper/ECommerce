import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { getCartTotal, clearCart } from './cart.js';
import { showToast } from './toast.js';

let razorpayKeyId = ''; // Typically passed dynamically or loaded from settings/env

export async function processCheckout(orderData, couponData) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to checkout', 'error');
    return;
  }

  // 1. Calculate final amounts
  const subtotal = getCartTotal();
  let discount = 0;
  if (couponData) {
    if (couponData.discount_type === 'percent') {
      discount = (subtotal * couponData.discount_value) / 100;
    } else {
      discount = couponData.discount_value;
    }
  }
  
  // Fetch shipping settings
  const { data: settings } = await supabase.from('settings').select('*');
  let shippingThreshold = 499;
  let flatCharge = 49;
  
  if (settings) {
    const sThresh = settings.find(s => s.key === 'free_shipping_threshold');
    const sCharge = settings.find(s => s.key === 'flat_shipping_charge');
    if (sThresh) shippingThreshold = parseFloat(sThresh.value);
    if (sCharge) flatCharge = parseFloat(sCharge.value);
  }

  const finalSubtotal = subtotal - discount;
  const shippingCharge = finalSubtotal >= shippingThreshold ? 0 : flatCharge;
  const total = finalSubtotal + shippingCharge;
  const totalPaise = Math.round(total * 100);

  // 2. Call create-razorpay-order edge function
  try {
    const { data: orderResponse, error: createError } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount_paise: totalPaise, receipt: 'rcpt_' + Date.now() }
    });

    if (createError || !orderResponse) {
      throw new Error(createError?.message || 'Failed to initialize payment');
    }

    const { id: rzp_order_id, amount, currency, key_id } = orderResponse;
    razorpayKeyId = key_id;

    // 3. Open Razorpay Modal
    const options = {
      key: key_id,
      amount: amount,
      currency: currency,
      name: 'My Store', // From settings
      description: 'Order Payment',
      order_id: rzp_order_id,
      prefill: {
        name: user.full_name || '',
        email: user.email || '',
        contact: orderData.shipping_address.phone || ''
      },
      handler: async function (response) {
        showToast('Payment successful, verifying...', 'info');
        
        // 4. Verify payment
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
          body: {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_data: {
              ...orderData,
              subtotal,
              discount,
              shipping_charge: shippingCharge,
              total,
              coupon_code: couponData ? couponData.code : null,
              user_id: user.id
            }
          }
        });

        if (verifyError || !verifyData?.success) {
          showToast('Payment verification failed. Please contact support.', 'error');
        } else {
          clearCart();
          window.location.href = `./order-success.html?order_id=${verifyData.order_id}`;
        }
      },
      theme: {
        color: '#2563eb'
      }
    };

    const rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
      showToast('Payment failed: ' + response.error.description, 'error');
    });
    rzp1.open();

  } catch (error) {
    showToast(error.message, 'error');
  }
}
