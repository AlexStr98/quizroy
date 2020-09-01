import React from "react";
import {Form,Container,Col,Row,Image,Alert} from "react-bootstrap";
import ReactCardFlip from "react-card-flip";
import socket from "./socketConfig";
import {Redirect} from "react-router-dom";
import Loader from 'react-loader-spinner';
var md5 = require('md5');


class SignIn extends React.Component{
    constructor(props){
        super();

        this.renderLogin = this.renderLogin.bind(this);
        this.register = this.register.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmationPassword = this.handleConfirmationPassword.bind(this);
        this.renderRegister = this.renderRegister.bind(this);
        this.login=this.login.bind(this);
        this.handleFlip = this.handleFlip.bind(this);
        this.renderRedirect = this.renderRedirect.bind(this);

        this.state={
            username:"",
            password:"",
            confirmationpassword:"",
            isFlipped:false,
            siteState:"register",
            redirect:false

        };
    }

    componentDidMount(){
        
        socket.on("logged_in",() => this.setState({redirect:true}));
        socket.on("username_taken",function(){
            alert("This username is already taken");
        });
        socket.on("wrong_credentials",function(){
            alert("This combination of credentials does not exist");
        });
        
    }

   
   

    handleFlip(e){
        e.preventDefault();
        this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    }

    handleUsernameChange(e){
        this.setState({username:e.target.value});
        
    }

    handlePasswordChange(e){
        this.setState({password:e.target.value});
       
    }

    handleConfirmationPassword(e){
        this.setState({confirmationpassword:e.target.value});
    }

    register(e){
        var self= this;
        e.preventDefault();
        document.getElementsByClassName("loaderReg")[0].style.display="inline-block";
        if(this.state.password !== this.state.confirmationpassword){
            alert("Your passwords are not the same :(");
        }else{
            let hashedPW= md5(this.state.password);
            fetch('/registerUser',{
                method:"POST",
                body:JSON.stringify({
                    username: this.state.username,
                    password:hashedPW
                }),
                header:{
                    "Content-Type":"application/json"
                }
                
            })
            .then(function(response){
                return response.json();
            })
            .then(function(myJson){
                if(myJson.isMSG === true){
                  alert(myJson.msg);  
                }
                if(myJson.logged_in === true){
                    self.setState({redirect:true});
                }
                
            })
        }
        
    }

    

    login(e){
        var self = this;
        e.preventDefault();
        document.getElementsByClassName("loaderLog")[0].style.display="inline-block";
        let hashedPW= md5(this.state.password);
        fetch('/loginUser',{
            method:"POST",
                body:JSON.stringify({
                    username: this.state.username,
                    password:hashedPW
                }),
                header:{
                    "Content-Type":"application/json"
                }
        })
        .then(function(response){
            return response.json();
        })
        .then(function(myJson){
            if(myJson.isMSG === true){
                alert(myJson.msg);  
              }
              if(myJson.logged_in === true){
                  self.setState({redirect:true});
              }
        })
    }

    renderRedirect(){
        if(this.state.redirect===true){
            return(
                <Redirect to="/" />
            );
        }
    }
    
    renderRegister(){
            return(
                <Row>
                    {this.renderRedirect()}
                    <Col>
                        <div id="registerDiv">
                            <div id="innerRegisterDiv">
                                <h1>Sign up</h1>
                                <Form id="registerForm" onSubmit={this.register}>
                                    <Form.Group>
                                        <Form.Control type="text" name="username" placeholder="Username" onChange={this.handleUsernameChange}></Form.Control>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Control type="password" name="password" placeholder="Password" onChange={this.handlePasswordChange}></Form.Control>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Control type="password" name="passwordConfirmation" placeholder="Confirm password" onChange={this.handleConfirmationPassword}></Form.Control>
                                    </Form.Group>
            
                                    <Row>
                                        <Col id="linkDiv"><a href="" onClick={this.handleFlip} id="loginLink">Login</a></Col>
                                        <Col><button type="submit" className="zoom" id="registerButton"><Loader className="loader loaderReg" type="TailSpin" color="white" height={30} width={30} /><span>Register</span></button></Col>
                                    </Row>
                                </Form>
                            </div>
                        </div>
                    </Col>
        
                    <Col>
                        <div id="logoDiv">
                            <Image src={require("./resources/Kilroy.svg")} fluid/>
                        </div>
                    </Col>
                </Row>
            ); 
        
        
    }

    renderLogin(){
        
           return(
            <Row>   
                <Col>   
                    <div id="logoDiv">
                        <Image src={require("./resources/Kilroy.svg")} fluid/>
                    </div>
                </Col>
                <Col>
                    <div id="registerDiv">
                        <div id="innerRegisterDiv">
                            <h1>Sign in</h1>
                            <Form id="loginForm" onSubmit={this.login}>
                                <Form.Group>
                                    <Form.Control type="text" name="username" placeholder="Username" onChange={this.handleUsernameChange}></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control type="password" name="password" placeholder="Password" onChange={this.handlePasswordChange}></Form.Control>
                                </Form.Group>
                                <Row>
                                    <Col id="linkDiv"><a href="" onClick={this.handleFlip} id="loginLink">Register</a></Col>
                                    <Col><button type="submit" className="zoom" id="registerButton"><Loader className="loader loaderLog" type="TailSpin" color="white" height={30} width={30} /><span>Login</span></button></Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </Col>
            </Row>
        );
        }
        
    

    render(){
        return(
            <div id="outerDiv">
                <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="vertical">
                    <Container className="registerPageContainer">  
                            {this.renderRegister()}
                    </Container>
                    <Container className="registerPageContainer">  
                            {this.renderLogin()}
                    </Container>
                </ReactCardFlip>  
            </div>
            
        );
    }
}

export {SignIn};