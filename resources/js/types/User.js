import moment from 'moment';
import Axios from 'axios';

export default class User {

    constructor() {

        this.id;
        this.firstname;
        this.surname;
        this.email;
        this.email_verified_at;
        this.capabilities;
        this.deleted_at;
        this.created_at;
        this.updated_at;

        var context = this;

        return new Promise(function(resolve,reject) {
            Axios.get('/api/user/get').then((response)=>{
                context.id = parseInt(response.data.id);
                context.firstname = response.data.firstname;
                context.surname = response.data.surname;
                context.email = response.data.email;
                context.email_verified_at = response.data.email_verified_at;
                context.capabilities = response.data.capabilities;
                context.deleted_at = (response.data.deleted_at!==null) ? moment(response.data.deleted_at) : null ;
                context.created_at = (response.data.created_at!==null) ? moment(response.data.created_at) : null ;
                context.updated_at = (response.data.updated_at!==null) ? moment(response.data.updated_at) : null ;
                resolve(context);
            }).catch((err)=> {
                reject(err);
            });
        });
    }

    hasCapability(capName) {
        if (typeof(this.capabilities[capName])!=='undefined') {
            return this.capabilities[capName];
        } else {
            return false;
        }
    }
}
