# Getting Started

## Setup

1. create a `createaccount.html` file
2. Add this to your html page 
```javascript
<script src="https://wispproject.netlify.app"></script>

<script>

    // this would be your path to your config
    const configpath = "config.json"

    // this would be your mode in which wisp would operate
    const mode = login

    // initialising wisp
    initialisewisp(configpath, mode);

    // function that which is responsible for loggin in the account
    async function createaccount() {
        // this is here to tell wisp to login the account when the function is triggered when clicked the login button
        const result = await wispcreateaccount();
        // here you can add what ever you want to do after the account is logged in
        console.log(result);
    }


</script>
```
3. create a `login.html` file 
4. add this to the login.html page
```javascript

<script src="https://wispproject.netlify.app/v1"></script>

<script>

    // this would be your path to your config
    const configpath = "config.json"

    // this would be your mode in which wisp would operate
    const mode = login

    // initialising wisp
    initialisewisp(configpath, mode);

    // function that which is responsible for loggin in the account
    async function createaccount() {
        // this is here to tell wisp to login the account when the function is triggered when clicked the login button
        const result = await wispcreateaccount();
        // here you can add what ever you want to do after the account is logged in
        console.log(result);
    }

</script>

```

> [!WARNING]  
> the token is saved in the cookies like `token="abc"` after creating/loggin the account 

5. create a file called `config.json`
6. add this to the config file
```json
{
    //NOTE: DO NOT END ANY OF THE LINKS WITH A "/" IN THE END
    // add the link to your login page 
    "loginpage": "http://127.0.0.1:5501/public/dash/login.html",
    // add the link to your create account page
    "createaccountpage": "http://127.0.0.1:5501/public/dash/createaccount.html",
    // here add the wisp api url 
    "wispapiurl": "https://api.wispproject.qzz.io",
    // add the page which would the user should be redirected to once they are authorised
    "redirectpage" : "http://127.0.0.1:5501/public/dash/dash.html"
}
```

7. login to the wisp dashboard at the wisp [dashboard](https://wispproject.netlify.app/dash/login)


> [!NOTE]  
> The origin is the base url off your frontend
8. enter your origin into the inputbox on the dashboard

## now you are all setup!

you can take a look at the functions here [here](./sdk-functions
.md) and backend error handeling [here](./backend-errors.md)




