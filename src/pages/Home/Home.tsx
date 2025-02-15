import { Feature, Input, Page } from '@/components'
import styles from './Home.module.scss'
import { Shield } from '@/assets/images'
import classNames from 'classnames'
import { AlertsIcon, MonitoringIcon, UpdatesIcon } from '@/assets/icons'
import { motion } from 'framer-motion'
import {
    appearBottomImageAnimation,
    appearTopAnimation,
    hoverAnimationEasy
} from '@/styles/animations'
import { useCallback, useEffect } from 'react'
import { useAAVEDataProvider } from '@/context'
import { useNavigate } from 'react-router'
import { isExtension } from '@/helpers/browserApi'
import { isAddress } from 'viem'
import toast from 'react-hot-toast'

const features = [
    {
        icon: MonitoringIcon,
        title: 'Privacy-First Web3 Updates',
        content:
            'Get weekly email reports, powered by DeCC technology, delivering precise insights like a hawk guarding your stats.'
    },
    {
        icon: AlertsIcon,
        title: 'Hawk-Eye Health Alerts',
        content:
            'Stay sharp with timely insights into your loan health, empowering you to make proactive, informed decisions.'
    },
    {
        icon: UpdatesIcon,
        title: 'Real-Time Monitoring',
        content:
            'Track your open DeFi lending positions in real time, keeping you ahead of changes with constant updates.'
    }
]

const Home = () => {
    const {
        updateViewOnlyAddress,
        isConnected,
        viewOnlyAddress,
        viewOnlyChainId,
        updateViewOnlyChainId
    } = useAAVEDataProvider()
    const navigate = useNavigate()

    const handleSubmitAddress = useCallback(
        (address: string) => {
            if (!isAddress(address)) {
                toast.error('Please enter a valid address!')
                return
            }
            updateViewOnlyAddress(address)
            updateViewOnlyChainId(viewOnlyChainId || 1)
            navigate('/dashboard')
        },
        [updateViewOnlyAddress, updateViewOnlyChainId, navigate]
    )

    useEffect(() => {
        if (isExtension && viewOnlyAddress) {
            navigate('/dashboard')
        }
    }, [viewOnlyAddress, navigate])

    return (
        <Page className={styles.home}>
            <div className={styles.wrapper}>
                <motion.div
                    className={styles.banner}
                    layout
                    whileInView={appearTopAnimation.visible}
                    initial={appearTopAnimation.hidden}
                    viewport={{ once: true }}
                >
                    <div className={styles.content}>
                        <div className={styles.poweredBy}>
                            <span className={styles.gradientTextSecondary}>POWERED BY DeCC</span>
                        </div>
                        <h1 className={classNames(styles.title, styles.gradientText)}>
                            Hawk’s eye view for your DeFi loans.
                        </h1>
                        <p className={styles.description}>
                            In the dynamic world of decentralized finance, keeping track of your
                            investments is crucial. SafeHawk provides the tools you need to monitor
                            your positions effortlessly.
                        </p>
                    </div>
                    {!isConnected ? (
                        <div className={styles.inputContainer}>
                            <label className={styles.inputLabel}>Insert Address</label>
                            <Input
                                name={'walletAddressInput'}
                                className={styles.inputBox}
                                placeholder={'0x'}
                                onSubmit={handleSubmitAddress}
                                defaultValue={viewOnlyAddress}
                            />
                        </div>
                    ) : (
                        <button className={styles.button} onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </button>
                    )}
                </motion.div>
                <div className={styles.imageContainer}>
                    <motion.img
                        src={Shield}
                        className={styles.image}
                        whileInView={appearBottomImageAnimation.visible}
                        whileHover={hoverAnimationEasy}
                        initial={appearBottomImageAnimation.hidden}
                        viewport={{ once: true }}
                    />
                </div>
            </div>
            <div className={styles.features}>
                {features.map((feature, index) => (
                    <Feature key={index} {...feature} />
                ))}
            </div>
        </Page>
    )
}

export default Home
