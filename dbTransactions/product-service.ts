import { db } from '@/db/db';
import { Connection, In, InsertResult, Like, Not, Repository, DeleteResult } from 'typeorm';
import { Product } from "@/db/entities/Product";
import { stringType } from 'aws-sdk/clients/iam';

class ProductServiceClass {
  public productRepo: Repository<Product>;
  private conn: Connection;

  public listProducts = async (size = 10, page = 1): Promise<[Product[],number]> => {
    await this.connect();
    let result = await this.productRepo.findAndCount({
      take: size,
      skip: size* (page-1),
      order:{
        id: "DESC"
      }
  })
  result[1] = await this.productRepo.count();
  return result;
  }

  public insert = async (insertData: Partial<Product>): Promise<Product> => {
    await this.connect();
    const insertResult = await this.productRepo.insert(insertData);

    return this.productRepo.findOne(insertResult.identifiers[0].id);
  }

  public get = async (ProductId: string): Promise<Product> => {
    return await this.productRepo.findOne(ProductId);
  }


  public delete = async (ProductId: number): Promise<DeleteResult> => {
    await this.connect();
    const Product = await this.productRepo.findOne(ProductId);
    let deleteResult = await this.productRepo.delete(ProductId);

    try {

    await this.productRepo.update(ProductId, Product);
    let deleteResult = await this.productRepo.delete(ProductId);
    if (deleteResult.affected == 1) return deleteResult;
  } catch (e) {
    return null;
    };
  }


  public update = async (id: string, updateData: Partial<Product>): Promise<Product> => {
    await this.connect();
    await this.productRepo.update(id, updateData);
    return this.productRepo.findOne(id)
  }

  public getAllProducts = async (size = 10, page = 1): Promise<[Product[], number]> => {
    await this.connect();
    const products = await this.productRepo.findAndCount({
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    products[1] = await this.productRepo.count();
    return products;
  };

  public getAllActiveProducts = async (size = 10, page = 1): Promise<[Product[], number]> => {
    await this.connect();
    const products = await this.productRepo.findAndCount({
      where: { status: 0 },
      skip: size * (page - 1),
      take: size,
      order: {
        id: 'DESC',
      },
    });
    return products;
  };

  public deleteProductById = async (productId: string): Promise<void> => {
    await this.connect();
    const product = await this.productRepo
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where('id = :id', { id: productId })
      .execute();
  };

  public updateProductById = async (
    productId: stringType,
    updateData: Partial<Product>,
  ): Promise<Product> => {
    await this.connect();
    await this.productRepo.update(productId, updateData);
    return this.productRepo.findOne(productId);
  };

  public getProductById = async (productId: string): Promise<Product> => {
    await this.connect();
    const product = await this.productRepo.findOne({ where: { id: productId } });
    return product;
  };

  private connect = async (): Promise<void> => {
    this.conn = await db.connect();
    if (!this.productRepo) {
      this.productRepo = this.conn.getRepository(Product);
    }
  };
}

export const ProductService = new ProductServiceClass();