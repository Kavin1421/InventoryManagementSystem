import { useState } from 'react';
import {Button, Col, Flex, Row} from 'antd';
import {FieldValues, useForm} from 'react-hook-form';
import CustomInput from '../components/CustomInput';
import toastMessage from '../lib/toastMessage';
import {useGetAllBrandsQuery} from '../redux/features/management/brandApi';
import {useGetAllCategoriesQuery} from '../redux/features/management/categoryApi';
import {useCreateNewProductMutation} from '../redux/features/management/productApi';
import {useGetAllSellerQuery} from '../redux/features/management/sellerApi';
import {ICategory} from '../types/product.types';
import CreateSeller from '../components/product/CreateSeller';
import CreateCategory from '../components/product/CreateCategory';
import CreateBrand from '../components/product/CreateBrand';
import { UploadOutlined } from '@ant-design/icons';

const CreateProduct = () => {
  const [createNewProduct] = useCreateNewProductMutation();
  const {data: categories} = useGetAllCategoriesQuery(undefined);
  const {data: sellers} = useGetAllSellerQuery(undefined);
  const {data: brands} = useGetAllBrandsQuery(undefined);

  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // 🔽 Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    if (!image) return;

    const data = new FormData();
    data.append('file', image);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    data.append('folder', 'inventory');

    try {
      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: data }
      );
      const result = await res.json();
      setUploading(false);

      if (result.secure_url) {
        setImageUrl(result.secure_url);
        toastMessage({ icon: 'success', text: 'Image uploaded successfully!' });
      } else {
        toastMessage({ icon: 'error', text: 'Image upload failed!' });
      }
    } catch (err) {
      setUploading(false);
      toastMessage({ icon: 'error', text: 'Image upload error!' });
    }
  };

  const onSubmit = async (data: FieldValues) => {
    if (!imageUrl) {
      toastMessage({ icon: 'error', text: 'Please upload a product image!' });
      return;
    }
  
    data.imageUrl = imageUrl;
    data.price = Number(data.price);
    data.stock = Number(data.stock);
  
    if (data.size === '') {
      delete data.size;
    }
  
    try {
      const res = await createNewProduct(data).unwrap();
      if (res.statusCode === 201) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        setImageUrl('');
      }
    } catch (error: any) {
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };
  

  const {
    handleSubmit,
    register,
    formState: {errors},
    reset,
  } = useForm();

  return (
    <>
      <Row
        gutter={30}
        style={{
          height: 'calc(100vh - 6rem)',
          overflow: 'auto',
        }}
      >
        <Col
          xs={{span: 24}}
          lg={{span: 14}}
          style={{
            display: 'flex',
          }}
        >
          <Flex
            vertical
            style={{
              width: '100%',
              padding: '1rem 2rem',
              border: '1px solid #164863',
              borderRadius: '.6rem',
            }}
          >
            <h1
              style={{
                marginBottom: '.8rem',
                fontWeight: '900',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              Add New Product
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CustomInput
                name='name'
                errors={errors}
                label='Name'
                register={register}
                required={true}
              />
              <CustomInput
                errors={errors}
                label='Price'
                type='number'
                name='price'
                register={register}
                required={true}
              />
              <CustomInput
                errors={errors}
                label='Stock'
                type='number'
                name='stock'
                register={register}
                required={true}
              />
          <Col xs={{ span: 24 }} lg={{ span: 8 }}>
  <Flex align="center" vertical style={{ margin: '1rem 0' }}>
    <Flex
      justify="center"
      style={{
        width: '100%',
        maxWidth: '300px',
        height: '200px',
        border: '2px solid gray',
        padding: '.5rem',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Product"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '6px',
          }}
        />
      ) : (
        <p style={{ margin: 'auto', color: '#aaa' }}>No image selected</p>
      )}
    </Flex>

    {uploading && (
      <p style={{ color: '#888', marginTop: '0.5rem' }}>Uploading...</p>
    )}

    <Flex style={{ padding: '1rem' }}>
      <input
        type="file"
        id="productImage"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <label
        htmlFor="productImage"
        style={{
          background: '#164863',
          color: '#fff',
          padding: '.5rem 1rem',
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          fontSize: '1rem',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        <UploadOutlined />
        Upload Product Image
      </label>
    </Flex>
  </Flex>
</Col>


              <Row>
                <Col xs={{span: 23}} lg={{span: 6}}>
                  <label htmlFor='Size' className='label'>
                    Seller
                  </label>
                </Col>
                <Col xs={{span: 23}} lg={{span: 18}}>
                  <select
                    {...register('seller', {required: true})}
                    className={`input-field ${errors['seller'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Select Seller*</option>
                    {sellers?.data.map((item: ICategory) => (
                      <option value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </Col>
              </Row>

              <Row>
                <Col xs={{span: 23}} lg={{span: 6}}>
                  <label htmlFor='Size' className='label'>
                    Category
                  </label>
                </Col>
                <Col xs={{span: 23}} lg={{span: 18}}>
                  <select
                    {...register('category', {required: true})}
                    className={`input-field ${errors['category'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Select Category*</option>
                    {categories?.data.map((item: ICategory) => (
                      <option value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </Col>
              </Row>

              <Row>
                <Col xs={{span: 23}} lg={{span: 6}}>
                  <label htmlFor='Size' className='label'>
                    Brand
                  </label>
                </Col>
                <Col xs={{span: 23}} lg={{span: 18}}>
                  <select
                    {...register('brand')}
                    className={`input-field ${errors['brand'] ? 'input-field-error' : ''}`}
                  >
                    <option value=''>Select brand</option>
                    {brands?.data.map((item: ICategory) => (
                      <option value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </Col>
              </Row>

              <CustomInput label='Description' name='description' register={register} />

              <Row>
                <Col xs={{span: 23}} lg={{span: 6}}>
                  <label htmlFor='Size' className='label'>
                    Size
                  </label>
                </Col>
                <Col xs={{span: 23}} lg={{span: 18}}>
                  <select className={`input-field`} {...register('size')}>
                    <option value=''>Select Product Size</option>
                    <option value='SMALL'>Small</option>
                    <option value='MEDIUM'>Medium</option>
                    <option value='LARGE'>Large</option>
                  </select>
                </Col>
              </Row>
              <Flex justify='center'>
                <Button
                  htmlType='submit'
                  type='primary'
                  style={{textTransform: 'uppercase', fontWeight: 'bold'}}
                >
                  Add Product
                </Button>
              </Flex>
            </form>
          </Flex>
        </Col>
        <Col xs={{span: 24}} lg={{span: 10}}>
          <Flex
            vertical
            style={{
              width: '100%',
              height: '100%',
              padding: '1rem 2rem',
              border: '1px solid #164863',
              borderRadius: '.6rem',
              justifyContent: 'space-around',
            }}  
          >
            <CreateSeller />
            <CreateCategory />
            <CreateBrand />
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default CreateProduct;
