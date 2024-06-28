import { frames } from "@/app/utils/frames";
import { dummyProjects } from "@/app/utils/projectArray";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

export type State = {
    chain: string;
};

const handleRequest = frames(async (ctx) => {

    const name = dummyProjects[0].name

    return {
        image: (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                }}
            >
                <BgImage />
            </div>
        ),
        imageOptions: {
            width: 650,
            height: 356,
        },
        buttons: [
            <Button action="post" target={`/projects/${name}`}>
                Browse
            </Button>,
        ],
    };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
    return <img src={`${env.HOST_URL}/projects.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
