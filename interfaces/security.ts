export type IAuthTokenRequestBody = {
    titleId:string,
    promotionId?:number
    token?:string
}

export interface ITokenParams{
    assetId:string,
    userId:string,
    accessToken:string,
    absoluteExpiration:Date,

}