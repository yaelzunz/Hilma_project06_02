import { useNavigate } from 'react-router-dom'
// Styles
import styles from '../../styles/components/article-item.module.css'
import ReactCardSlider from 'react-card-slider-component';


// Default image url
const DEFAULT_IMG_URL =
    'https://avatars.mds.yandex.net/i?id=47c293f66ae2dc215b27c504a76c026c-3757598-images-thumbs&n=13'

/**
 * Compnent renders an article item.
 * @param article The article details.
 */
export default function ArticleItem({ title, image, uri }) {
    // States
    const navigate = useNavigate()

    const slides = [
        {image: image, title: title},
    ]
    // const title_id = title.replace(/[^a-zA-Z0-9 ]/g, '')    Remove all non-alphanumeric characters from the title

    return (
        //  <div className={styles['sdd']}>
        // <ReactCardSlider slides={slides}/>
                                
        // </div>
        <div onClick={() => navigate(`/article/uri/${uri}`)}>
            <ReactCardSlider slides={slides}/>
            {/* <h4 className={styles['title']}>{title}</h4>
            <img
                src={image ?? DEFAULT_IMG_URL}
                onError={e => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = DEFAULT_IMG_URL
                }}
                alt="imageurl"
            /> */}
        </div>
    )
}
