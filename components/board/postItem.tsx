import Link from 'next/link';
import styles from '../../styles/board/board.module.css';
import { Category, Post } from "../../types/boardType";

interface PostItemProps extends Post {
    boardId: string,
    categoryList: {
        [index: string]: Category
    }
}

export const PostItem = ({
    boardId,
    categoryList,
    id,
    user,
    category,
    title,
    createdAt,
    hit,
    totalComments,
    totalLikes
}: PostItemProps) => {

    return (
        <li className={`${styles.post_item} rows`}>
            <div className={styles.total_comments}>{totalComments}</div>
            <div className='flex-main cols'>
                <Link href={`/board/${boardId}/${id}`}>
                    <a className={styles.post_title}>{title}</a>
                </Link>
                <div className='rows space-between'>
                    <div className={styles.user_info}>
                        <img className='user-profile' src={`https://auth.bssm.kro.kr/resource/user/profile/profile_${user.code}.png`} onError={e => e.currentTarget.src = '/icons/profile_default.png'} alt='user profile' />
                        <span>{user.nickname}</span>
                    </div>
                    <div className={styles.post_info}>
                        <span className={styles.total_likes}>{totalLikes}</span>
                        {category !== 'normal' && <span>{categoryList[category]?.name}</span>}
                        <span className={styles.post_hit}>{hit}</span>
                        <span className={styles.post_date}>{new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </li>
    );
}