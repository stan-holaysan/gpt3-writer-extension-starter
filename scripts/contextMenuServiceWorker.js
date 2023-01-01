// Function to get + decode API key
const getKey = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        if (result['openai-key']) {
          const decodedKey = atob(result['openai-key']);
          resolve(decodedKey);
        }
      });
    });
};


// Send message to DOM
const sendMessage = (content) => {
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   const activeTab = tabs[0].id;

    //   chrome.tabs.sendMessage(
    //     activeTab,
    //     { message: 'inject', content },
    //     (response) => {
    //       if (response.status === 'failed') {
    //         console.log('injection failed.');
    //       }
    //     }
    //   );
    // });

    chrome.tabs.query({ url: 'https://www.calmlywriter.com/online/?utm_source=buildspace.so&utm_medium=buildspace_project' }, (tabs) => {
        const activeTab = tabs[0].id;
  
        chrome.tabs.sendMessage(
          activeTab,
          { message: 'inject', content },
          (response) => {
            if (response.status === 'failed') {
              console.log('injection failed.');
            }
          }
        );
      });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = 'https://api.openai.com/v1/completions';
	
  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });
	
  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
    try {
        console.log("generating...")
        sendMessage('generating...');

        const { selectionText } = info;
        const basePromptPrefix = "In the verbal style of Kobe Bryant, write a short introductory paragraph stating the usefulness of the basketball move ";
        const basePromptPostfix = ". Then, give a detailed step-by-step tutorial for performing the move in the format of a numbered list."
        const baseCompletion = await generate(`${basePromptPrefix}"${selectionText}"${basePromptPostfix}\n`);
        // console.log(typeof(baseCompletion.text))
        sendMessage(baseCompletion.text);


        // // Add your second prompt here
        // const secondPrompt = `
        //     Take the table of contents and title of the blog post below and generate a blog post written in thwe style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.
            
        //     Title: ${selectionText}
            
        //     Table of Contents: ${baseCompletion.text}
            
        //     Blog Post:
        //     `;

        // // Call your second prompt
        // const secondPromptCompletion = await generate(secondPrompt);
        // // Send the output when we're all done
        // sendMessage(secondPromptCompletion.text);
    } catch (error) {
        console.log(error);
        sendMessage(error.toString());
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'context-run',
      title: 'Generate blog post',
      contexts: ['selection'],
    });
  });
  
// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);