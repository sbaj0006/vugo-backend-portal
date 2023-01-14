import { APIGatewayEvent, Handler } from 'aws-lambda';
import { badRequest, failure, success, unauthorized } from '@lib/response-lib';
import { authWrapper } from '@lib/authWrapper';

import { AdminService } from '@dbTransactions/admin-service'

import { Admin } from '@/db/entities/Admin'
import { DeleteResult } from 'typeorm';
import { IAdminRequest } from '@interfaces/admin';
import { createTokenObject, encryptPassword, verifyHashedPassword } from '@lib/auth-lib';
import { IAccessTokenObj } from '@interfaces/auth';


export const getAdminByIdHandler: Handler = authWrapper('Admin', async (event: APIGatewayEvent) => {

    const adminId: string = event.pathParameters.adminId
    try {
        const retAdmin: Admin | null = await AdminService.getAdminById(adminId)
        if(!retAdmin) return badRequest({message:'Admin not found'})
        delete retAdmin.hashedPassword;
        return await success(retAdmin)

    } catch (error) {

        return await failure({ message: error.message || error })
    }

})
export const getAdminMeHandler: Handler = authWrapper('Admin', async (event: APIGatewayEvent) => {

    const adminId: string = event.pathParameters.adminId
    try {
        const retAdmin: Admin = await AdminService.getAdminById(adminId)
        delete retAdmin.hashedPassword;
        return await success(retAdmin)

    } catch (error) {
        return await failure({ message: error.message || error })
    }

})
export const deleteAdminHandler: Handler = authWrapper('Admin',async (event: APIGatewayEvent) => {

    const adminId: string = event.pathParameters.adminId
    try {
        const ret: DeleteResult = await AdminService.deleteDBAdmin(adminId)
        return await success(ret)

    } catch (error) {
        return await failure({ message: error.message || error })
    }

})
export const createAdminHandler: Handler = authWrapper('Admin',async (event: APIGatewayEvent) => {
    var adminData: IAdminRequest;

    try {
        adminData = JSON.parse(event.body);

    } catch (error) {
        return badRequest({ message: error.message || error })
    }
    try {
        let newAdmin: Admin = new Admin();
        newAdmin.firstName= adminData.firstName;
        newAdmin.lastName= adminData.lastName;
        newAdmin.username= adminData.email;
        newAdmin.hashedPassword = await encryptPassword(adminData['password']);

        const retAdmin: Admin = await AdminService.createAdmin(newAdmin)
        delete retAdmin.hashedPassword;
        return await success(retAdmin)

    } catch (error) {
        return await failure({ message: error.message || error })
    }

})
export const adminSignInHandler: Handler = async (event: APIGatewayEvent) => {
    var adminData: IAdminRequest
    //check the schema
    try {
        adminData = JSON.parse(event.body);

    } catch (error) {
        return await badRequest({ message: error.message || error })
    }


    try {

        const retAdmin: Admin = await AdminService.getAdminByEmail(adminData.email)

        if (!retAdmin) return await unauthorized({ message: 'Incorrect Credentials' })

        //check password
        const match = await verifyHashedPassword(adminData['password'], retAdmin.hashedPassword);

        if (!match) return await unauthorized({ message: 'Incorrect Credentials' })

        //sign the token
        let tokenObj: IAccessTokenObj = createTokenObject(retAdmin.id, 3600);
        //delete the fields that we dont want to show
        delete retAdmin.hashedPassword, retAdmin.updatedAt, retAdmin.createdAt

        const retObj = {
            ...retAdmin,
            token: tokenObj
        }


        return await success(retObj)



    } catch (error) {
        return await failure({ message: error.message || error })
    }

}   