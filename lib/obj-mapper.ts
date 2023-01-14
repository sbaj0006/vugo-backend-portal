export const ObjMapper = (obj, func) => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v)]));
};


export const mapProductResult =(productResult)=>{
  
  const res = productResult.map((res) => {
  type productType = {
    productName: string;
    productPrice: string;
    startDateTime: string;
    endDateTime: string;
  };
  let product: productType = {
    productName: res["productname"],
    productPrice: res["productprice"],
    startDateTime: res["startdatetime"],
    endDateTime: res["enddatetime"],
  };
  return product;
});

  return res;
}