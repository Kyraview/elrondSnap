export class Utils{

    static async confirm(title : string, subHeading: string, textAreaContent : string | null =null) : Promise<boolean>{
        const output = await wallet.request({
            method: 'snap_confirm',
            params: [
              {
                prompt: title,
                description: subHeading,
                textAreaContent: textAreaContent
              },
            ],
        });
        return output as boolean;
    }
    static async notify(text: string){
        await wallet.request({
            method: 'snap_notify',
            params: [
              {
                type: 'native',
                message: text
              },
            ],
        });
        
    }
    static shortenAddress(addr: string) : string{
        const top = addr.slice(0,5)
        const bottom = addr.substring(addr.length -5)
        return `${top}...${bottom}`
    }
}