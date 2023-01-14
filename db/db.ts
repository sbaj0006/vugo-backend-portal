import "reflect-metadata";
import {
  Connection,
  ConnectionManager,
  getConnectionManager,
  createConnection,
} from "typeorm";
import CONFIG from "../config";
import { UserSignIn } from "./entities/UserSignIn";
import { PageLayout } from "./entities/PageLayout";
import { Rail } from "./entities/Rail";
import { TitleMetadata } from "./entities/TitleMetadata";
import { RailTitles } from "./entities/RailTitles";
import { Series } from "./entities/Series";
import { Season } from "./entities/Season";
import { Episode } from "./entities/Episode";
import { GeoFence } from "./entities/GeoFence";
import { GeoPoint } from "./entities/GeoPoint";
import { WhiteListedIp } from "./entities/WhiteListedIp";
import { S3Asset } from "./entities/S3Asset";
import { UserProduct } from "./entities/UserProduct";
import { Product } from "./entities/Product";
import { UserProductPaymentIntent } from "./entities/UserProductPaymentIntent";
import { TitlePublication } from "./entities/TitlePublication";
import { User } from "./entities/User";
import { Sites } from "./entities/Sites";
import { SecurityCheckTypes } from "./entities/SecurityCheckTypes";
import { SocialAccount } from "./entities/SocialAccount";
import { UserPurchase } from "./entities/UserPurchase";
import { Admin } from "./entities/Admin";
import { Promotion } from "./entities/Promotion";
import { PromotionCode } from "./entities/PromotionCode";
import { CodeRedemption } from "./entities/CodeRedemption";
import { GroupedTitle } from "./entities/GroupedTitle";
import { TitleGroup } from "./entities/TitleGroup";
class Database {
  public connection: Connection;
  public adminConnection: Connection;
  private connections: ConnectionManager;

  constructor() {
    this.connections = getConnectionManager();
  }

  public connect = async (): Promise<Connection> => {
    if (this.connection) {
      if (!this.connection.isConnected) {
        await this.connection.connect();
      }
      return this.connection;
    }
    let connection;
    const entities = [
      User,
      Sites,
      SecurityCheckTypes,
      UserSignIn,
      UserProduct,
      Product,
      SocialAccount,
      UserPurchase,
      TitleMetadata,
      Rail,
      RailTitles,
      PageLayout,
      Admin,
      Series,
      Season,
      Episode,
      GeoFence,
      GeoPoint,
      WhiteListedIp,
      S3Asset,
      UserProductPaymentIntent,
      TitlePublication,
      Promotion,
      PromotionCode,
      CodeRedemption,
      TitleGroup,
      GroupedTitle,
    ];
    if (CONFIG.isLocal) {
      connection = this.connections.create({
        type: "postgres",
        ...(CONFIG.isLocal ? CONFIG.db.local : CONFIG.db[CONFIG.stage]),
        entities: entities,
      });
      await connection.connect();
    } else {
      connection = await createConnection({
        type: "postgres",
        ...CONFIG.db[CONFIG.stage],
        entities: entities,
      });
    }

    this.connection = connection;
    return connection;
  };

  public disconnectAll = async (): Promise<boolean> => {
    if (this.connection) {
      await this.connection.close();
      return true;
    }
    return false;
  };
}

export const db = new Database();
