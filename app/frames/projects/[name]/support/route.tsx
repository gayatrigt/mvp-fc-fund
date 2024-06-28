import { frames } from "@/app/utils/frames";
import { dummyProjects } from "@/app/utils/projectArray";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

const handleRequest = async (
    req: NextRequest,
    { params: { name: name } }: { params: { name: string } }
) => {
    return await frames(async (ctx) => {

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
            textInput: "Enter amount to send on Base",
            buttons: [
                <Button action="post" target={`/projects/${name}`}>
                    Back
                </Button>,
                <Button action="post" target={`/projects`}>
                    Home
                </Button>,
                <Button action="post" target={`/projects/${name}/support/confirm`}>
                    Support 💰
                </Button>,
            ],
        };
    })(req)
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
    return <img src={`${env.HOST_URL}/eth.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;