import { DeleteFilled, EditFilled, PrinterFilled } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import SearchInput from '../../components/SearchInput';
import toastMessage from '../../lib/toastMessage';
import { useDeleteSaleMutation, useGetAllSaleQuery } from '../../redux/features/management/saleApi';
import { IProduct } from '../../types/product.types';
import { ITableSale } from '../../types/sale.type';
import formatDate from '../../utils/formatDate';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SaleManagementPage = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isFetching } = useGetAllSaleQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page: page }));
  };

  const tableData = data?.data?.map((sale: ITableSale) => ({
    key: sale._id,
    productName: sale.productName,
    productPrice: sale.productPrice,
    buyerName: sale.buyerName,
    quantity: sale.quantity,
    totalPrice: sale.totalPrice,
    date: formatDate(sale.date),
  }));

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 10);

    autoTable(doc, {
      head: [['Product Name', 'Price', 'Buyer', 'Qty', 'Total', 'Date']],
      body: data?.data?.map((sale: ITableSale) => [
        sale.productName,
        sale.productPrice,
        sale.buyerName,
        sale.quantity,
        sale.totalPrice,
        formatDate(sale.date),
      ]),
    });

    doc.save('sales_report.pdf');
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Product Name',
      key: 'productName',
      dataIndex: 'productName',
    },
    {
      title: 'Product Price',
      key: 'productPrice',
      dataIndex: 'productPrice',
      align: 'center',
    },
    {
      title: 'Buyer Name',
      key: 'buyerName',
      dataIndex: 'buyerName',
      align: 'center',
    },
    {
      title: 'Quantity',
      key: 'quantity',
      dataIndex: 'quantity',
      align: 'center',
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      dataIndex: 'totalPrice',
      align: 'center',
    },
    {
      title: 'Selling Date',
      key: 'date',
      dataIndex: 'date',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <div style={{ display: 'flex', gap: 4 }}>
            <InvoiceModal item={item} />
            <UpdateModal product={item} />
            <DeleteModal id={item.key} />
          </div>
        );
      },
      width: '1%',
    },
  ];

  return (
    <>
      <Flex justify='space-between' style={{ margin: '5px', gap: 4 }}>
        <SearchInput setQuery={setQuery} placeholder='Search Sold Products...' />
        <Button type='primary' onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Flex>
      <Table
        size='small'
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />
      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={query.page}
          onChange={onChange}
          defaultPageSize={query.limit}
          total={data?.meta?.total}
        />
      </Flex>
    </>
  );
};

/**
 * Invoice Modal
 */
const InvoiceModal = ({ item }: { item: ITableSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .header, .footer { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Masala company Pvt Ltd</h1>
            <p>123, Street Name, City, Country</p>
            <hr/>
          </div>
          <h3>Invoice</h3>
          <table>
            <tr><th>Product</th><td>${item.productName}</td></tr>
            <tr><th>Price</th><td>${item.productPrice}</td></tr>
            <tr><th>Quantity</th><td>${item.quantity}</td></tr>
            <tr><th>Total</th><td>${item.totalPrice}</td></tr>
            <tr><th>Buyer</th><td>${item.buyerName}</td></tr>
            <tr><th>Date</th><td>${item.date}</td></tr>
          </table>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'purple' }}
      >
        <PrinterFilled />
      </Button>
      <Modal title='Invoice Preview' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div>
          <h2 style={{ textAlign: 'center' }}>Masala Company Pvt Ltd</h2>
          <p style={{ textAlign: 'center' }}>123, Street Name, City, Country</p>
          <hr />
          <h3>Invoice</h3>
          <table style={{ width: '100%', marginBottom: '1rem' }}>
            <tbody>
              <tr><td><b>Product</b></td><td>{item.productName}</td></tr>
              <tr><td><b>Price</b></td><td>{item.productPrice}</td></tr>
              <tr><td><b>Quantity</b></td><td>{item.quantity}</td></tr>
              <tr><td><b>Total</b></td><td>{item.totalPrice}</td></tr>
              <tr><td><b>Buyer</b></td><td>{item.buyerName}</td></tr>
              <tr><td><b>Date</b></td><td>{item.date}</td></tr>
            </tbody>
          </table>
          <Flex justify='end' gap={8}>
            <Button onClick={handlePrint} type='primary'>Print</Button>
            <Button onClick={handleCancel}>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

/**
 * Update Modal (You can complete this later)
 */
const UpdateModal = ({ product }: { product: IProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit } = useForm();

  const onSubmit = (data: FieldValues) => {
    console.log({ product, data });
  };

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'green' }}
      >
        <EditFilled />
      </Button>
      <Modal title='Update Product Info' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Working on it...!!!</h1>
          <Button htmlType='submit'>Submit</Button>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSale] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSale(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'red' }}
      >
        <DeleteFilled />
      </Button>
      <Modal title='Delete Product' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Are you want to delete this product?</h2>
          <h4>You won't be able to revert it.</h4>
          <Flex justify='center' gap={16} style={{ marginTop: '1rem' }}>
            <Button onClick={handleCancel} type='primary' style={{ backgroundColor: 'lightseagreen' }}>Cancel</Button>
            <Button onClick={() => handleDelete(id)} type='primary' style={{ backgroundColor: 'red' }}>Yes! Delete</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default SaleManagementPage;
