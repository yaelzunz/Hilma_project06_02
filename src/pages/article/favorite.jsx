import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../firebase/config'
import { NewsApiAiUri, bodyReqNewsApiAiUri } from '../../configs/url.config'
import { useAuthState } from 'react-firebase-hooks/auth'
import styles from '../../styles/pages/home.module.css'
import styles1 from '../../styles/pages/search.module.css'
import { Backdrop, CircularProgress } from '@mui/material'
import ArticleItem from '../../components/article/ArticleItem'


export default function Favorite() {

  const [isLoading, setIsloading] = useState(true)
  const [user, loading, error] = useAuthState(auth)
  const [myArticles, setMyArticles] = useState([])




  const getData = async () => {

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


  return (
    <div className={styles['Home']}>
      <div className={styles['modal']}>
                      <section className={styles['favorite-articles']}>
                      <div className={styles['heading']}>
                        <div className={styles['title']}>
                            {isLoading && 
                            <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={isLoading}
                          >
                            <CircularProgress color="inherit" />
                          </Backdrop> }

                            <h1>המאמרים המועדפים שלך</h1>
                        </div>
                      
                    </div>
                    <div className={styles1['articles-list-group']}>
                    <div className={styles1['articles-list']}>
                            {myArticles.map?.((a, i) => (
                            <ArticleItem key={i} {...a} />
                        ))}
                    </div>
                    </div>

                </section>
                </div>
    </div>
  )
}
