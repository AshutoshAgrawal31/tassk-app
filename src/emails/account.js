const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.sendgridapi)


const sendmail=async(email,name)=>{
    try{
        await sgMail.send({
            to:email,
            from:'agrawalashutosh2000@gmail.com',
            subject:'Thanks for joining in!',
            text:'Welcome to the app,${name}.'
        })
    }catch(e){
        console.log('error');
    }
}

const cancelmail=async(email,name)=>{
    try{
        await sgMail.send({
            to:email,
            from:'agrawalashutosh2000@gmail.com',
            subject:'Sorry to see you go',
            text:'Goodbye ${name}.'
        })
    }catch(e){
        console.log('error');
    }
}

module.exports={
    sendmail,
    cancelmail
}