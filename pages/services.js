import Layout from "../components/Layout/Layout";
import {Card, Cards} from "../components/Cards/Cards";


export default function Services() {
    return (
        <Layout>
            <h1>Services</h1>
            <Cards>
                <Card title={'Production'} subtitle={'Full Song Production'} description={'Let me turn your song idea into reality. Post-production included.'} sections={[
                    {
                        title: 'Pricing',
                        description: '25 USD base price. Additional costs depending on scale and specifications.'
                    }
                ]} href={'/services/production'} />
                <Card title={'Post-Production'} subtitle={'Mixing and Mastering'} description={'Let me polish up your song into something that just wants to be heard.'} sections={[
                    {
                        title: 'Pricing',
                        description: '5 USD per minute of song, discounts available for LPs and EPs (min. 3 tracks)'
                    }
                ]} href={'/services/post-production'} />
                <Card title={'Soundtrack'} subtitle={'Add life to your media'} description={'Let me compose an entire soundtrack for your Game / Movie / Shortfilm. This includes complete Production of the songs including Post-Production based on your wishes. Sound Editing for video mediums NOT included by default.'} sections={[
                    {
                        title: 'Pricing',
                        description: 'Per request basis'
                    }
                ]} href={'/services/soundtrack'} />
                <Card title={'Sound Design'} subtitle={'SFX for your projects'} description={'Let me record and design SFX for your game / movie / shortfilm based on your wishes.'} sections={[
                    {
                        title: 'Pricing',
                        description: 'Per request basis',
                    }
                ]} href={'/services/sound-design'} />
                <Card title={'Web-App'} subtitle={'Make your ideas a reality'} description={'Let me code a web app according to your specifications.'} sections={[
                    {
                        title: 'Pricing',
                        description: 'Per request basis',
                    }
                ]} href={'/services/web-app'} />
            </Cards>
        </Layout>
    );
}