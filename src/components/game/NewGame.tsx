import LogInNavBar from "../LogInNavBar";
import {
    Card,
    CardMedia,
    Checkbox,
    FormControl, FormControlLabel, FormGroup, FormLabel,
    Grid,
    InputLabel,
    ListItemIcon,
    Select,
    SelectChangeEvent,
    Box,
    TextField, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Dialog, Tooltip, Stack
} from "@mui/material";
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import React from "react";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import {rootUrl, domain} from "../../base.routes";
import CSS from "csstype";
import {Alert} from "react-bootstrap";
import {useUserStore} from "../../store";
import {useNavigate, useParams} from "react-router-dom";
import AttachMoneyTwoToneIcon from '@mui/icons-material/AttachMoneyTwoTone';
const NewGame = () => {
const {id} = useParams();
const [title, setTitle] = React.useState("");
const [description, setDescription] = React.useState(" ");
const [creatorId, setCreatorId] = React.useState(0);
const [genre, setGenre] = React.useState('');
const [errorMessage, setErrorMessage] = React.useState("");
const [errorFlag, setErrorFlag] = React.useState(false);
const [allGenres, setGenres] = React.useState<Genre[]>([]);
const [allPlatforms, setAllPlatforms] = React.useState<PlatformCheckedState[]>([]);
const [price, setPrice] = React.useState(0);
const authorization = useUserStore();
const token = authorization.token;
const navigate = useNavigate();
const [image, setImage] = React.useState('https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png');
const [imageFile, setImageFile] = React.useState<File | null>(null);
const [originImage, setOriginImage] = React.useState('');
const [titleExist, setTitleExist] = React.useState<string[]>([]);
const [originTitle, setOriginTitle] = React.useState('');
const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
const fileInputRef = React.useRef<HTMLInputElement>(null);

const onCreateGame = async () => {
        console.log("Chosen platforms: ", allPlatforms.filter(p => p.isSelected));
        console.log("Chosen platforms id: ", allPlatforms.filter(p => p.isSelected).map(i => i.platformId));
        if(!title.trim()) {
            setErrorFlag(true);
            setErrorMessage("Game must have title!");
            return;
        }
        if(title.trim()) {
            if (titleExist.includes(title.trim())) {
                setErrorFlag(true);
                setErrorMessage("Title already exists! Please choose another name!");
                return;
            }
        }
        if(description.trim().length < 1) {
            setErrorFlag(true);
            setErrorMessage("Game must have description");
            return;
        }
        if (!genre) {
            setErrorFlag(true);
            setErrorMessage("Game must have genre");
            return;
        }
        if (allPlatforms.filter(p => p.isSelected).length < 1) {
            setErrorFlag(true);
            setErrorMessage("Game must have at least 1 platform");
            return;
        }
        if (typeof price !== 'number' || price < 0) {
            setErrorFlag(true);
            setErrorMessage("Game price can not be null");
            return;
        }
        if (!imageFile) {
            setErrorFlag(true);
            setErrorMessage("Must have image");
            return;
        }
        try {
            const gamePost = await axios.post(domain + rootUrl + "/games", {
                title: title,
                description: description,
                creationDate: new Date(),
                genreId: parseInt(genre, 10),
                price: price * 100,
                platformIds: allPlatforms.filter(p => p.isSelected).map(i => parseInt(String(i.platformId), 10))
            }, {
                headers: {
                    "X-Authorization": token
                }
            })
            const createdId = gamePost.data["gameId"]
            console.log("created data: ", gamePost);
            console.log("created id: ", createdId);
            await axios.put(domain + rootUrl + "/games/" + createdId + "/image", imageFile, {
                headers: {
                    "X-Authorization": token,
                    "Content-Type": imageFile?.type,
                }
            })
            navigate(`/game-review/users/${creatorId}/myGames`);
        } catch (error: any) {
            setErrorFlag(true);
            setErrorMessage(error.toString());
        }
}
const onUpdateGame = async () => {
        if(title.trim().length < 1) {
            setErrorFlag(true);
            setErrorMessage("Game must have title!");
            return;
        }
        if(titleExist.includes(title.trim()) && title.trim() !== originTitle) {
            setErrorFlag(true);
            setErrorMessage("Title already exists! Please choose another name!");
            return;
        }
        if(description.trim().length < 1) {
            setErrorFlag(true);
            setErrorMessage("Game must have description");
            return;
        }
        if (!genre) {
            setErrorFlag(true);
            setErrorMessage("Game must have genre");
            return;
        }
        if (allPlatforms.filter(p => p.isSelected).length < 1) {
            setErrorFlag(true);
            setErrorMessage("Game must have at least 1 platform");
            return;
        }
        if (typeof price !== 'number' || price < 0) {
            setErrorFlag(true);
            setErrorMessage("Game price can not be null");
            return;
        }
        try {
            await axios.patch(domain + rootUrl + "/games/" + id, {
                gameId: id,
                title: title,
                description: description,
                genreId: parseInt(genre, 10),
                price: price * 100,
                platformIds: allPlatforms.filter(p => p.isSelected).map(i => parseInt(String(i.platformId), 10))
            }, {
                headers: {
                    "X-Authorization": token
                }
            })
            if (imageFile) {
                await axios.put(domain + rootUrl + "/games/" + id + "/image", imageFile, {
                    headers: {
                        "X-Authorization": token,
                        "Content-Type": imageFile?.type,
                    }
                })
            }
            navigate('/game-review/games/' + id);
        } catch (error) {
            setErrorFlag(true);
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.message.toString());
            }
            setErrorMessage("Unexpected error");
        }
}
const getAllTitles = async () => {
    await axios.get("http://localhost:4941" + rootUrl + "/games/")
        .then((response) => {
            const allTitles = response.data['games'].map((g:any)=> g.title);
            setTitleExist(allTitles);
        })
}
React.useEffect(() => {
    getGenres();
    getAllTitles();
    getPlatforms().then(() => {
            if (id) {
                getGame().then((res) => {
                        console.log("Game: ", res);
                        setTitle(res.title);
                        setOriginTitle(res.title);
                        setDescription(res.description);
                        setCreatorId(res.creatorId);
                        setGenre(res.genreId.toString());
                        setPrice((parseFloat(res.price) / 100));
                        setAllPlatforms(prevPlatforms =>
                            prevPlatforms.map(platform => ({
                                ...platform,
                                isSelected: res.platformIds.includes(platform.platformId)
                            })))
                    }
                );
                getGameImage();
            } else {
                setTitle("");
                setDescription("");
                setGenre('');
                setPrice(0);
                setAllPlatforms(prevPlatforms =>
                    prevPlatforms.map(platform => ({
                        ...platform,
                        isSelected: false
                    })))
                setImage('');
                setImageFile(null);
            }
        }
    );
}, [id])

const getGameImage = async () => {
    await axios.get(domain + rootUrl + "/games/" + id + "/image", {
        responseType: 'blob',
    })
        .then((response) => {
            const imgUrl = URL.createObjectURL(response.data);
            setImage(imgUrl);
            setOriginImage(imgUrl);
        }, (error) => {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setErrorFlag(false);
                } else {
                    setErrorFlag(true);
                    setErrorMessage(error.message.toString());
                }

            }

        })
}
const getGame = async () => {
    const gameResponse = await axios.get(domain + rootUrl + "/games/" + id);
    return gameResponse.data;
}
const handlePlatformSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorFlag(false);
    const { name, checked } = event.target;
    setAllPlatforms((prev) => {
        const update = prev.map((p) =>
            p.name === name ? { ...p, isSelected: checked } : p
        )
        return update;
    });
};

const getGenres = async () => {
    await axios.get(domain+ rootUrl + '/games/genres')
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            setGenres(response.data.map((g: Genre) => ({...g, checked: false })));
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.toString());
        })
}

const getPlatforms = async () => {
    await axios.get(domain+ rootUrl + '/games/platforms')
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            const platformsWithSelection = response.data.map((platform: any) => ({
                ...platform,
                isSelected: false
            }));
            console.log("platformsWithSelection: ", platformsWithSelection);
            setAllPlatforms(platformsWithSelection);
            console.log("platforms: ", allPlatforms);
            setErrorFlag(false);
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage(error.message.toString());
        })
}
const handleSelectGenreChange = (event: SelectChangeEvent) => {
    setGenre(event.target.value as string);
    setErrorFlag(false);
};

const updateTitleState = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.currentTarget.value);
    setErrorFlag(false);
}
const updatePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.currentTarget.value.startsWith('-')|| !e.currentTarget.value) {
        setErrorFlag(true);
        setPrice(0);
        setErrorMessage("Price will be $0 by default");
    } else {
        setErrorMessage('');
        setPrice(Math.round(parseFloat(e.currentTarget.value) * 100) / 100);
        setErrorFlag(false);
    }
}
const updateDescriptionState = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setDescription(e.currentTarget.value);
    setErrorFlag(false);
}
const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        if(e.target.files[0]) {
            const file = e.target.files[0];
            const fileSizeMB = file.size / (1024 * 1024);
            if(fileSizeMB >= 5) {
                setErrorFlag(true);
                setErrorMessage('Image size can not exceed 5MB');
                window.scrollTo({top:0});
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            setErrorFlag(false);
            setErrorMessage('');
            setImage(URL.createObjectURL(e.target.files[0]));
            setImageFile(e.target.files[0]);
        }
    }
}
const handleRemoveImage = () => {
    setImage(originImage);
    setImageFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
}
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: 200,
        },
    },
};
const creatCardStyles: CSS.Properties = {
    display: "inline-block",
    width: "100%",
}
return (
    <>
        <LogInNavBar/>
        {errorFlag && (<>{window.scrollTo({top:0})}<Alert variant="danger">Error: {errorMessage}</Alert></>)}
        <Card sx={{creatCardStyles, width:'100%'}}>
            <h1>
                Game Information
            </h1>
            <Grid container columnSpacing={{xs: 1, sm: 2, md: 3}}>
                <Grid size={6}>
                    <FormControl fullWidth sx={{my: 2}} variant="outlined">
                        <TextField
                            required
                            type="text"
                            id="title-required"
                            label="Title"
                            onChange={updateTitleState}
                            value={title}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            sx={{my: 2}}
                        />
                        <TextField
                            multiline
                            type="text"
                            id="description-required"
                            rows={8}
                            label="Description"
                            value={description}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={updateDescriptionState}
                            sx={{my: 2}}
                        />
                    </FormControl>
                        <Box sx={{flexGrow: 1, justifyContent: 'flex-start', alignItems: 'flex-start', display:'flex'}}>
                        <Grid container columnSpacing={{xs: 1, sm: 2, md: 3}}>
                            <Grid size={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="select-genre">Genre</InputLabel>
                                    <Select
                                        required
                                        sx={{my: 1, width:'100.px'}}
                                        labelId="select-genre"
                                        id="select-genre"
                                        value={allGenres.map(g => g.genreId).includes(parseInt(genre, 10)) ? genre : ''}
                                        onChange={handleSelectGenreChange}
                                        MenuProps={MenuProps}
                                    >
                                        {allGenres.map(genre => (
                                            <MenuItem value={genre.genreId}>{genre.name}</MenuItem>
                                        ))
                                        }
                                    </Select>
                                </FormControl>
                                <ListItemIcon sx={{width:'100%'}}>
                                    <AttachMoneyTwoToneIcon sx={{my: 3}} fontSize="large"/>
                                    <TextField fullWidth
                                        type="number"
                                        id="price-required"
                                        label="Price"
                                        onChange={updatePrice}
                                        value={price}
                                        placeholder='$0 by default...'
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                        }}
                                       inputProps={{
                                           min: 0
                                       }}
                                        sx={{my: 2}}
                                />
                                </ListItemIcon>
                            </Grid>
                            <Grid size={6} sx={{justifyContent: 'center', alignItems: 'center'}}>
                                <FormLabel style={{color: "gray"}} color="info" required>Platform compatible: </FormLabel>
                                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                {allPlatforms.length > 0 && (
                                    <FormGroup>
                                        {allPlatforms.map((p) => (
                                            <FormControlLabel
                                                key={p.platformId}
                                                control={
                                                    <Checkbox
                                                        checked={p.isSelected ?? false}
                                                        onChange={handlePlatformSelectChange}
                                                        name={p.name}
                                                    />
                                                }
                                                label={p.name}
                                            />
                                        ))}
                                    </FormGroup>
                                )}
                                </Box>
                            </Grid>
                        </Grid>
                        </Box>
                    </Grid>
                    <Grid size={6} sx={{justifyContent:'space-between'}}>
                            <input type="file" ref={fileInputRef} accept="image/png, image/jpg, image/jpeg, image/gif" onChange={(e) => {
                                handleUploadImage(e);
                            }}/>
                            <Tooltip title={'Revert original image'}>
                                <SettingsBackupRestoreIcon fontSize='large' onClick={() => {
                                    setOpenDeleteDialog(true)
                                }}/>
                            </Tooltip>
                        <CardMedia
                            component="img"
                            sx={{objectFit: "contain", justifyContent: 'center', alignItems: 'center', width:'100%'}}
                            image={image.length > 0 ? image : "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"}
                        />
                    </Grid>
                </Grid>
            {creatorId !== 0 && (
                <button style={{margin:'2rem'}} type="button" className="btn btn-success" onClick={(e) => {
                    e.preventDefault();
                    onUpdateGame();
                }}>Update Game
                </button>
            )}
            {creatorId === 0 && (
                <button style={{margin:'2rem'}} type="button" className="btn btn-success" onClick={(e) => {
                    e.preventDefault();
                    onCreateGame();
                }}>Create Game
                </button>
            )}
        </Card>
        <Dialog
            open={openDeleteDialog}
            onClose={()=>setOpenDeleteDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">
                {"Revert image?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to revert image?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setOpenDeleteDialog(false)}>Cancel</Button>
                <Button variant="outlined" color="error" onClick={() => {
                    setOpenDeleteDialog(false);
                    handleRemoveImage();
                }} autoFocus>
                    Revert
                </Button>
            </DialogActions>
        </Dialog>
    </>
)
}
export default NewGame;