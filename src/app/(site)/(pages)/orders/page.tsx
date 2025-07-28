'use client';

import Breadcrumb from "@/components/Common/Breadcrumb";
import Orders from "@/components/Orders";

const OrdersPage = () => {
  return (
    <>
      <Breadcrumb title={"My Orders"} pages={["Orders"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <Orders />
        </div>
      </section>
    </>
  );
};

export default OrdersPage; 