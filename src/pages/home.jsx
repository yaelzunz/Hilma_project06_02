import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Assets
import { AiFillStar, AiOutlineSearch } from 'react-icons/ai'
// Utils
import { removeDuplicates } from '../utils/objects.util'
// Styles
import styles from '../styles/pages/home.module.css'
// Components
import ArticleItem from '../components/article/ArticleItem'
// firebase
import { auth, db } from '../firebase/config'
import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
// Configs
import { NEWS_DATA_API_KEY } from '../configs/apikeys.config'
import { NEWS_API_URL, NewsApiAi, NewsApiAiUri, bodyReqNewsApiAi, bodyReqNewsApiAiUri } from '../configs/url.config'

import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import ReactCardSlider from 'react-card-slider-component';
import styles1 from '../styles/pages/search.module.css'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

/**
 * Component renders the `404 not found` page.
 */
function Home() {
    // States

    const [data, setData] = useState([])
    const [open, setOpen] = useState(false);


    const navigate = useNavigate()
    const [user, loading, error] = useAuthState(auth)

    // Articles
    const [isLoading, setIsloading] = useState(true)
    const [myArticles, setMyArticles] = useState([])
    const [interestingArticles, setInterestingArticles] = useState([])
    const [title, setTitle] = useState()
    const [image, setImage] = useState()

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };


    const getData = async () => {
          const minWordCount = 500,
          maxWordCount = 1000
        if (loading) {
            console.log('Loading user data')
            return
        } else if (error) {
            // An error occurred while fetching user data
            window.location.href = '/login'
        } else {
            // User is authenticated
            console.log('User is authenticated:', user.email)

            // Get user details
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (!userDoc.exists()) {
                // User document does not exist
                console.log('User document does not exist')
                return
            }
            

            // Get random interest from array.
            const interests = userDoc.data().interests
            const random_interest = Math.round(Math.random() * interests.length)
            // Get suggested articles
            const interests_as_str = interests[random_interest]
            console.log({random_interest})


            bodyReqNewsApiAi.keyword = interests_as_str
            const res = await fetch(NewsApiAi,{
                method: "POST",
                body: JSON.stringify(bodyReqNewsApiAi), headers: {"Content-type": "application/json; charset=UTF-8"} 
            })

            const data = await res.json()

            let results = data.articles.results.filter(article => {
              const wordCount = article.body?.split(' ').length ?? 0
              return wordCount > minWordCount && wordCount < maxWordCount
          })

            const isDuplicate = results.filter((e)=>{return !e.isDuplicate})

            // Set interesting articles to results with no duplicates (by title)
            setInterestingArticles(isDuplicate)

            // Get user articles
            const userArticles = userDoc.data().favoriteArticles ?? []
            const _myArticles = []
            for (const uri of userArticles) {
              // get favorite articles by uri                
            bodyReqNewsApiAiUri.articleUri = uri
            const res = await fetch(NewsApiAiUri,{
                method: "POST",
                body: JSON.stringify(bodyReqNewsApiAiUri), headers: {"Content-type": "application/json; charset=UTF-8"} 
            })
            
            const data1 = await res.json()
            console.log({uri})
            console.log({data1})
            const article = data1[uri].info
            console.log({article})
            _myArticles.push(article)

            }
            setMyArticles(_myArticles)
            // Set is-loading (for articles data) to false
            setIsloading(false)
        }
    }

    // Effects
    useEffect(() => {
        // Load data on initial page load.
        if (user) {
            getData()
        }
    }, [user])

    useEffect(() => {
      handleClickOpen()
    },[])

const sliderClick = () => {
return true
}
    return (
        <div className={styles['Home']}>
          {isLoading && 
              <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={isLoading}
            >
              <CircularProgress color="inherit" />
            </Backdrop> }

            <div className={styles['modal']}>
                {/* <section className={styles['favorite-articles']}> */}
                    <div className={styles['heading']}>
                        <div className={styles['title']}>
                            <h1>מאמרים שיכולים לעניין אותך</h1>
                        </div>
                    </div>
                <section className={styles['interesting-articles']}>
                    <div className={styles1['articles-list-group']}>
                    <div className={styles1['articles-list']}>
                        {interestingArticles.map?.((a, i) => (
                            <ArticleItem key={i} {...a} />
                        ))}
                    </div>
                    </div>
                </section>
            </div>
            {/* <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
         ! ברוכים הבאים לאתר קאפיש
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
            consectetur ac, vestibulum at eros.
          </Typography>
          <Typography gutterBottom>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
          </Typography>
          <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
            magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
            ullamcorper nulla non metus auctor fringilla.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div> */}
        </div>
    )
}

export default Home

    