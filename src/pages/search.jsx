import { useEffect, useState } from 'react'
// Firebase
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../firebase/config'
// Utils
import { removeDuplicates } from '../utils/objects.util'
// Components
import ArticleItem from '../components/article/ArticleItem'
// Icons
import { AiOutlineSearch } from 'react-icons/ai'
// Configs
import { NEWS_DATA_API_KEY } from '../configs/apikeys.config'
import { NEWS_API_URL, NewsApiAi, bodyReqNewsApiAi } from '../configs/url.config'
import * as WordDifficulty from '../difficulty/WordDifficulty'
// Styles
import styles from '../styles/pages/search.module.css'

export default function ChoosePage() {
    // States
    const queryParams = new URLSearchParams(window.location.search)
    const q = queryParams.get('q')

    const [query, setQuery] = useState(q ?? '')
    const [difficulty, setDifficulty] = useState(WordDifficulty.EASY)
    const [data, setData] = useState([])
    const [user, loading, error] = useAuthState(auth)

    const [interestingArticles, setInterestingArticles] = useState([])
    const [myArticles, setMyArticles] = useState([])

    const getArticales = async () => {
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
            const res = await fetch(NEWS_API_URL.search(interests_as_str))


            const data = await res.json()

            // Remove duplicate articles & set interesting-articles
            const uniqueArticles = removeDuplicates(data.results ?? [], (a, b) => a.article_id === b.article_id)
            setInterestingArticles(uniqueArticles)

            // Get user articles
            const userArticles = userDoc.data().favoriteArticles ?? []
            console.log({ userArticles })
            const _myArticles = []
            for (const title of userArticles) {
                // Get article data by title (as id)
                const res = await fetch(NEWS_API_URL.by_title(title))
                const data = await res.json()
                console.log('ufavorite articles from news api')
                console.log({ data })
                if (uniqueArticles?.[0]) _myArticles.push(uniqueArticles?.[0])
            }
            setMyArticles(_myArticles)
        }
    }

    // Handlers
    const getData = async () => {
        // Get user details
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
            // User document does not exist
            console.log('User document does not exist')
            return
        }
        // Set user difficulty
        setDifficulty(userDoc.data().diffuculty ?? WordDifficulty.EASY)
    }

    const searchArticlesHandler = async () => {
        // Load articles on screen.

        const minWordCount = 500,
            maxWordCount = 1000

        // const res = await fetch(NEWS_API_URL.search(query))
        bodyReqNewsApiAi.keyword = query
        const res = await fetch(NewsApiAi,{
            method: "POST",
            body: JSON.stringify(bodyReqNewsApiAi), headers: {"Content-type": "application/json; charset=UTF-8"} 
        })
        
        const data = await res.json()

        // // Filter articles by word count
        let results = data.articles.results.filter(article => {
            const wordCount = article.body?.split(' ').length ?? 0
            return wordCount > minWordCount && wordCount < maxWordCount
        })

        // // Set articles
        setData(results)
        return
    }

    // Effects
    useEffect(() => {
        if (user) {
            getData()
            getArticales()
        }
    }, [user])

    useEffect(() => {
        // Make initial load request if params exist.
        if (q) {
            searchArticlesHandler()
        }
    }, [])

    return (
        <div className={styles['container']}>
            <section className={styles['form']}>
                {/* <div className={styles['input-search']}>
                    <input
                        placeholder="Search topics"
                        defaultValue={query}
                        onChange={event => setQuery(event.target.value)}
                        type="text"
                    />
                    <button className={styles['submit']} onClick={searchArticlesHandler}>
                        <AiOutlineSearch size={18} />
                    </button>
                </div> */}
            </section>
            <section className={styles['articles-list-group']}>
                <h3>Show results for "{query}"</h3>
                <div className={styles['articles-list']}>
                    {data.map((article, i) => (
                        <ArticleItem key={i} {...article} />
                    ))}
                </div>
            </section>
        </div>
    )
}
