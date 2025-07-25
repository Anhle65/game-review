import React, { useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import axios from "axios";
import {rootUrl, domain} from "../../base.routes";
import CSS from "csstype";
import {Alert} from "react-bootstrap";
import {
    Box, Button,
    Card,
    CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    TextField, Tooltip,
    Typography
} from "@mui/material";
import LogoutNavBar from "../LogoutNavBar";
import {useUserStore} from "../../store";
import LogInNavBar from "../LogInNavBar";
import Avatar from "@mui/material/Avatar";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from "@mui/icons-material/Close";

const UserRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [error, setError] = useState('');
    const [errorFlag, setErrorFlag] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCfPassword, setShowCfPassword] = useState(false);
    const [image, setImage] = React.useState('');
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const authorization = useUserStore();
    const token = authorization.token;
    const userId = authorization.userId;
    const navigate = useNavigate();
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const updateEmailState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
        setError('');
        setErrorFlag(false);
    }

    const updateFnameState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFname(event.target.value.trim())
        setError('');
        setErrorFlag(false);
    }
    const updateLnameState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLname(event.target.value.trim())
        setError('');
        setErrorFlag(false);
    }
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowCfPassword = () => setShowCfPassword((show) => !show);
    const updatePasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
        setError('');
        setErrorFlag(false);
    }
    const updateConfirmPasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value)
        setError('');
        setErrorFlag(false);
    }
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const onSubmit = async () => {
        setErrorFlag(false);
        setError('');
        console.log("mage data: ",imageFile);
        if (fname.length < 1) {
            setError("Fist name can not be null");
            setErrorFlag(true);
            return;
        }
        if (lname.length < 1) {
            setError("Last name can not be null");
            setErrorFlag(true);
            return;
        }
        if(!email){
            setError("Email can not be null");
            setErrorFlag(true);
            return;
        }
        if (password.length < 6 || password.length > 64) {
            setError("Password length must be from 6 to 64 characters");
            setErrorFlag(true);
            return;
        }
        if (password !== confirmPassword) {
            setErrorFlag(true);
            setError('Password and confirm password is not matched');
            return;
        }
        if (!token) {
            try {
                await axios.post(domain + rootUrl + '/users/register', {
                    firstName: fname,
                    lastName: lname,
                    email: email,
                    password: password
                }, {
                    timeout: 10000
                });
                setErrorFlag(false);
                setError('');
                console.log(email);
                console.log('fname' + fname);
                console.log('lname' + lname);

                const response = await axios.post("http://localhost:4941" + rootUrl + '/users/login', {
                    email: email,
                    password: password
                }, {
                    timeout: 10000
                });
                const {userId, token} = response.data;
                authorization.setAuthorization(userId, token);
                // console.log("userId:", userId);
                // console.log("token:", token);
                if (imageFile) {
                    await axios.put(domain + rootUrl + '/users/' + userId + '/image',
                        imageFile,
                        {
                            headers: {
                                "X-Authorization": token,
                                "Content-Type": imageFile?.type,
                            }
                        })
                }
                navigate('/game-review/games/');
            } catch (error: any) {
                console.log(error);
                console.log('fname:' + fname);
                console.log('lname:' + lname);
                console.log(email);
                console.log(password);
                setErrorFlag(true);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 400) {
                        setError("Invalid email");
                    } else {
                        if (error.response?.status === 403) {
                            setError("Email is already used");
                        } else
                            setError(error.toString());
                    }
                } else {
                    setError("Unexpected error");
                }
            }
        } else {
            setErrorFlag(true);
            setError('You need to logout first to register');
        }
    };
    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if(e.target.files[0]) {
                const file = e.target.files[0];
                const fileSizeMB = file.size / (1024 * 1024);
                if(fileSizeMB >= 5) {
                    setErrorFlag(true);
                    setError('Image size can not exceed 5MB');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return;
                }
                setErrorFlag(false);
                setError('');
                setImage(URL.createObjectURL(e.target.files[0]));
                setImageFile(e.target.files[0]);
            }
        }
    }
    const handleRemoveImage = () => {
        setImage("https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png");
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    const signUpCardStyles: CSS.Properties = {
        display: "inline-block",
        margin: "10px",
        padding: "20px",
    }
    return (
        <>{(userId && token) && (
            <>
                <LogInNavBar />
            </>
        )}
            {(!userId || !token)  && (
                <>
                    <LogoutNavBar />
                </>
            )}
            <div className="signup-form-container">
                {errorFlag && (
                    <>
                    {window.scrollTo({top:0})}
                    <Alert variant="danger">{error}</Alert>
                </>)}
                <Card sx={{signUpCardStyles, minHeight: "100vh", minWidth: "100vw"}}>
                    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CardContent>
                        <h2 className="signup-title">Register</h2>
                        <form>
                            <Stack direction="column" spacing={2}>
                                <TextField
                                    fullWidth
                                    required
                                    id="first-name-required"
                                    label="First name"
                                    onChange={updateFnameState}
                                />
                                <TextField
                                    fullWidth
                                    required
                                    id="last-name-required"
                                    onChange={updateLnameState}
                                    label="Last name"
                                />
                                <TextField
                                    fullWidth
                                    required
                                    type="text"
                                    id="email-required"
                                    label="Email"
                                    onChange={updateEmailState}
                                />
                                    <FormControl variant="outlined">
                                    <InputLabel htmlFor="outlined-adornment-password" >Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-password"
                                        type={showPassword ? 'text' : 'password'}
                                        onChange={updatePasswordState}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Password"
                                    />
                                    </FormControl>
                                <FormControl variant="outlined">
                                    <InputLabel htmlFor="outlined-adornment-cornfirmpassword" >Confirm Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment-cornfirmpassword"
                                        type={showCfPassword ? 'text' : 'password'}
                                        onChange={updateConfirmPasswordState}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showCfPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickShowCfPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showCfPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Confirm Password"
                                    />
                                </FormControl>
                                <label style={{alignItems:'flex-start', display: 'flex'}} >Upload image here: </label>
                                <Stack direction='row' spacing={2}>
                                <br/>
                                    <input type="file" ref={fileInputRef} accept="image/png, image/jpeg, image/jpg, image/gif" onChange={(e) => {
                                        handleUploadImage(e);
                                    }}/>
                                    <Tooltip title={'Remove image'}>
                                        <CloseIcon color='error' fontSize='large' onClick={() => {
                                            setOpenDeleteDialog(true)
                                        }}/>
                                    </Tooltip>
                                </Stack>
                                <Avatar alt="User Image" sx={{ width: 100, height: 100 }} src={image.length !== 0 ? image : "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"} />
                                <button type="button" className="btn btn-success" onClick={(e) => {
                                    e.preventDefault(); // Prevent form from refreshing the page
                                    onSubmit();
                                }}>Create account
                                </button>
                                <Typography variant="subtitle2" align="center">
                                    Already had account?
                                    <NavLink to={'/users/login'} end>
                                        Login
                                    </NavLink>
                                </Typography>
                            </Stack>
                        </form>
                    </CardContent>
                    </Box>
                </Card>
                <Dialog
                    open={openDeleteDialog}
                    onClose={()=>setOpenDeleteDialog(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Remove image?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to remove image?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>setOpenDeleteDialog(false)}>Cancel</Button>
                        <Button variant="outlined" color="error" onClick={() => {
                            handleRemoveImage();
                            setOpenDeleteDialog(false);
                        }} autoFocus>
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}
export default UserRegister;