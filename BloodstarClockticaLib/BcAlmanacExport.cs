using Markdig;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;

namespace BloodstarClockticaLib
{
    internal class AlmanacExporter
    {
        private readonly BcDocument document;
        private readonly string imageUrlPrefix;
        private StreamWriter writer;
        internal AlmanacExporter(BcDocument document, string imageUrlPrefix)
        {
            this.document = document;
            this.imageUrlPrefix = imageUrlPrefix;
        }
        public void Export(Stream stream)
        {
            using (writer = new StreamWriter(stream, Encoding.UTF8, 1024, true))
            {
                Html();
            }
            writer = null;
        }
        private void Write(string s) => writer.Write(s);
        private void Html()
        {
            Write($@"<!DOCTYPE html><html lang=""en-US"">");
            Head();
            Body();
            Write("</html>");
        }
        private void Head()
        {
            Write("<head>");
            Write(Meta);
            Write(Links);
            Title();
            Style();
            Write($"</head>");
        }
        private const string Meta = @"<meta charset=""utf-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1"">";
        private void Title()
        {
            Write("<title>");
            Write(document.Meta.Name);
            Write(" Almanac</title>");
        }
        private const string Links = @"
            <link href=""https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap"" rel=""stylesheet"">
            <link rel=""preconnect"" href=""https://fonts.gstatic.com"">
            <link href=""https://fonts.googleapis.com/css2?family=PT+Serif&display=swap"" rel=""stylesheet"">
            <link href=""https://fonts.googleapis.com/css2?family=Nova+Script&display=swap"" rel=""stylesheet"">
            <link href=""https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap"" rel=""stylesheet"">";
        private const string Styles = @"
            html,body{height:100%;font-size:16px}
            body{
                background:#333;
                color:#eee;
                font-family:'PT Serif', serif;
                margin:0;
                text-align:justify;
                scrollbar-color:#999 #666;
                scrollbar-width:thin;
            }
            *::-webkit-scrollbar {
                width:10px;
                height:10px;
            }
            *::-webkit-scrollbar-track {
                background:#666;
            }
            *::-webkit-scrollbar-thumb {
                background:#999;
            }
            h1, h2, h3, h4, h5, h6, h7 {
                margin:0.2rem 0 0.2rem 0;
                font-family: 'Nova Script', cursive;
                text-transform:uppercase;
            }
            h1, h2{font-size:2.4rem}
            h3, h4, h5, h6, h7 {font-size:1.2rem}
            hr{width:80%;border:1px solid}
            ol.nav {
                flex:0 0 124px;
                font-family:'Roboto Condensed',sans-serif;
                font-size:1rem;
                list-style:none;
                display:flex;
                flex-flow:column nowrap;
                margin:0;
                padding:1vh 0.2rem 1vh 0.2rem;
                height:97vh;
                overflow-x:hidden;
                overflow-y:auto;
            }
            .nav a{
                text-align:center;
                vertical-align:bottom;
                text-decoration:none;
                color:#eee;
            }
            .nav a:hover{
                text-decoration:underline;
                box-shadow: 0 0 0.1em #333;
            }
            .almanac-row{
                display:flex;
                flex-flow:row;
                justify-content:center;
                margin:0 auto;
                width:100vw;
                height:100vh;
                overflow:hidden;
            }
            .almanac-viewport {
                flex:0 1 800px;
                list-style:none;
                margin:0;
                padding:0;
                display: flex;
                align-items: stretch;
                justify-content: space-between;
                flex-flow: column nowrap;
                scroll-behavior: smooth;
                overflow-x:hidden;
                overflow-y:auto;
                height:100vh;
            }
            .page {
                list-style:none;
                flex: none;
                margin:0 0.6rem 0.6rem 0;
                position:relative;
            }
            .page img{
                max-width:90vw;
            }
            .page-contents{
                margin:auto;
                padding:4.8rem 3.7rem;
                display:flex;
                flex-flow: column nowrap;
                align-items: center;
                background-repeat: no-repeat;
                background-size: 19.2rem;
                background-position: top;
                background-position-y: 2.4rem;
                color:#333;
            }
            .spacer{height:11rem}
            #synopsis > .page-contents > p, #overview > .page-contents > p{
                width:60%;
            }

            /*paper effect*/
            .page::before{
                content:"""";
                position:absolute;
                left:0;
                top:0;
                right:0;
                bottom:0;
                box-shadow:0 0 4.5rem #966e49 inset;
                z-index:-1;
                background-color:#eadbca;
            }

            .generated-by{
              list-style:none;
              padding:0 0 1rem 0;
              text-align:center;
              font-size:0.6rem;
              flex:none;
              font-family:'Roboto Condensed',sans-serif;
            }
            .generated-by a{
                color:#ccf
            }
            .team{
                font-family: 'MedievalSharp', cursive;
                writing-mode:vertical-rl;
                text-orientation: upright;
                text-transform: uppercase;
                position: absolute;
                top: 4.8rem;
                left: 3.2rem;
                letter-spacing:-0.4rem;
                width:unset;
                font-size:1.8rem;
                margin:0;
            }
            p{
                margin-top:0.4rem;
                margin-bottom:0.4rem;
            }
            .inline-logo{
                float:left;
                margin:-0.4rem 0.4rem 0 -3.2rem;
                width:6.4rem;
            }
            #synopsis > .page-contents{
                font-family: 'MedievalSharp', cursive;
                color:#933;
            }
            .ability{
                width:60%;
                font-family:'Roboto Condensed',sans-serif;
                text-align:center;
            }
            .flavor{
                width:60%;
                font-style:italic;
                color:#704c29;
                text-align:center;
                font-size:0.8rem;
            }
            .overview, .example, .how-to-run {
                width:80%;
            }
            .tip > p {
                width:80%;
                color:#933;
                padding:20px;
                background:rgba(255, 255, 255, 0.35);
                border:4px solid #933;
                margin-left:auto;
                margin-right:auto;
            }

            /* big letter */
            #synopsis > .page-contents > p:nth-child(1)::first-letter {
                font-size:2rem;
            }
            .overview > p:nth-child(1)::first-letter {
                font-family: 'MedievalSharp', cursive;
                font-size: 5rem;
                float:left;
                line-height:0.7;
                margin: 0 0.3rem 0 -0.4rem;
            }
            .overview > p:nth-child(1) {
                min-height: 3.5rem;
            }

            /* bullets */
            .overview > p + p {
                position:relative;
                margin-left:1.3rem;
            }
            .overview > p + p::before {
                content:'•';
                font-size:1.4rem;
                position:absolute;
                line-height:0.9;
                top:0;
                left:-1.4rem;
            }

            @media only screen and (max-width:799px){
                .page-contents{
                    padding:8vw;
                    background-position-y:1vw;
                    background-size:48vw;
                }
                .spacer{
                    height:26vw;
                }
                html{font-size:16px;}
                ol.nav {font-size:1rem;}
                .flavor p{font-size:0.875rem;}

                /* big letter and bullets*/
                .overview > p:nth-child(1)::first-letter {font-size: 4rem;}

                h1, h2{font-size:2.25rem}
                h3, h4, h5, h6, h7 {font-size:1.125rem}
                .team{
                    font-size:1.25rem;
                    letter-spacing:-0.25rem;
                    left:8vw;
                    top:8vw;
                }
            }
            @media only screen and (max-width:650px){
                .page-contents{
                    background-size:57vw;
                }
                .spacer{
                    height:31vw;
                }
                .almanac-row{
                    flex-flow:column nowrap;
                    justify-content:start;
                }
                ol.nav {
                    height:unset;
                    flex:0 1 auto;
                    flex-flow:row;
                    align-items:center;
                    overflow-x: auto;
                    overflow-y: hidden;
                }
                .nav li{
                    flex:1 0 auto;
                    margin:0 5px;
                }
                .almanac-viewport{
                    height:100%;
                    flex:0 1 auto;
                }
                #synopsis > .page-contents > p,
                #overview > .page-contents > p {width:100%}
                .team{
                    font-size:3vw;
                    letter-spacing:0;
                    top:10vw;
                }
                .ability, .flavor, .overview, .example, .how-to-run{
                    width:80vw;
                }
                .tip > p{width:75vw;}
                .inline-logo{margin-left:0}
            }
            @media only screen and (max-width:450px){
                h1, h2{font-size:8vw}
                h3, h4, h5, h6, h7 {font-size:4vw}
            }";
        private void Style()
        {
            Write("<style>");
            Write(Styles);
            Write("\n.page::before{background-image:url('");
            Write(BcExport.UrlCombine(imageUrlPrefix, "paper.png"));
            Write("');}");
            Write(GenerateTeamColorStyles("townsfolk", "003fb2"));
            Write(GenerateTeamColorStyles("outsider", "006893"));
            Write(GenerateTeamColorStyles("minion", "9f0000"));
            Write(GenerateTeamColorStyles("demon", "940000"));
            Write(GenerateTeamColorStyles("traveler", "553412"));
            Write("</style>");
        }
        private string GenerateTeamColorStyles(string name, string colorHex)
        {
            return $@"
                .{name} h1,
                .{name} h2,
                .{name} h3,
                .{name} h4,
                .{name} h5,
                .{name} h6,
                .{name} h7,
                .{name} .ability,
                .{name} .team,
                .{name} .overview > p:nth-child(1)::first-letter,
                .{name} .overview > p + p::before {{
                    color:#{colorHex};
                }}
                .{name} hr {{border-color:#{colorHex}}}
                ";
        }
        private void Body()
        {
            writer.Write("<body>");
            AlmanacPlusNav();
            writer.Write("</body>");
        }
        private void AlmanacPlusNav()
        {
            writer.Write(@"<div class=""almanac-row"">");
            Nav();
            Almanac();
            writer.Write("</div>");
        }
        private void Nav()
        {
            writer.Write(@"<ol class=""nav"">");
            NavItems();
            writer.Write(@"</ol>");
        }
        private void NavItems()
        {
            if (!string.IsNullOrWhiteSpace(document.Meta.Synopsis))
            {
                NavItem("Synopsis", "synopsis");
            }
            if (!string.IsNullOrWhiteSpace(document.Meta.Overview))
            {
                NavItem("Overview", "overview");
            }
            foreach (var character in ExportedCharacters)
            {
                NavItem(character.Name, character.Id);
            }
        }
        private IEnumerable<BcCharacter> ExportedCharacters => document.Characters.Where(c => c.IncludeInExport);
        private void NavItem(string label, string id)
        {
            Write(@"<li><a href=""#");
            Write(id);
            Write(@""">");
            Write(label);
            Write("</a></li>");
        }
        private void Almanac()
        {
            Write(@"<ol class=""almanac-viewport"">");
            Synopsis();
            Overview();
            Characters();
            Write(GeneratedBy);
            Write(@"</ol>");
        }
        private void Synopsis()
        {
            if (!string.IsNullOrWhiteSpace(document.Meta.Synopsis))
            {
                Write(@"<li class=""page"" id=""synopsis""><div class=""page-contents"">");
                Write(Markdown.ToHtml(document.Meta.Synopsis));
                Write($@"<img src=""{BcExport.UrlCombine(imageUrlPrefix, "logo.png")}"" alt=""{document.Meta.Name}"">");
                Write($@"</div></li>");
            }
        }
        private void Overview()
        {
            if (!string.IsNullOrWhiteSpace(document.Meta.Overview))
            {
                Write(@"<li class=""page"" id=""overview""><div class=""page-contents"">");
                string inlineLogo = ($@"<img src=""{BcExport.UrlCombine(imageUrlPrefix, "logo.png")}"" alt=""{document.Meta.Name}"" class=""inline-logo"">");
                Write(Markdown.ToHtml(inlineLogo + document.Meta.Overview));
                Write($@"</div></li>");
            }
        }
        private void WriteSection(string contents, string cssClass)
        {
            if (!string.IsNullOrWhiteSpace(contents))
            {
                Write($@"<div class=""{cssClass}"">");
                Write(Markdown.ToHtml(contents));
                Write("</div>");
            }
        }
        private void Characters()
        {
            foreach (var character in ExportedCharacters)
            {
                Write(@"<li class=""page"" id=""");
                Write(character.Id);
                Write(@"""><div class=""page-contents ");
                Write(BcTeam.ToExportString(character.Team));
                Write(@"""");

                // character token
                if (character.ProcessedImage != null)
                {
                    Write(@"style=""background-image:url('");
                    Write(BcExport.UrlCombine(imageUrlPrefix, $"{character.Id}.png"));
                    Write(@"');""><div class=""spacer""></div");
                }

                Write(@">");

                // name
                Write(@"<h2>");
                Write(character.Name);
                Write("</h2>");

                // ability
                Write(@"<p class=""ability"">");
                if (!string.IsNullOrWhiteSpace(character.Ability))
                {
                    Write(character.Ability);
                }
                Write("</p>");

                // line
                Write("<hr>");

                // flavor
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Flavor))
                {
                    WriteSection($"“{character.AlmanacEntry.Flavor}”", "flavor");
                }

                // overview
                WriteSection(character.AlmanacEntry.Overview, "overview");

                // Examples
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Examples))
                {
                    Write(@"<h3>Examples</h3>");
                    WriteSection(character.AlmanacEntry.Examples, "example");
                }

                // How to run
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.HowToRun))
                {
                    Write(@"<h3>How to Run</h3>");
                    WriteSection(character.AlmanacEntry.HowToRun, "how-to-run");
                }

                // Tips
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Tip))
                {
                    WriteSection(character.AlmanacEntry.Tip, "tip");
                }

                // team
                Write(@"<p class=""team"">");
                Write(BcTeam.ToDisplayString(character.Team));
                Write("</p>");
            }
        }
        private const string GeneratedBy = @"<li class=""generated-by"">this almanac generated using <a href=""http://meyermike.com/md/?botctools"">Bloodstar Clocktica</a></li>";
    }

    class BcAlmanacExport
    {
        /// <summary>
        /// write out an almanac for the custom edition
        /// </summary>
        /// <param name="document"></param>
        /// <param name="directory"></param>
        /// <param name="imageUrlPrefix"></param>
        internal static void ExportAlmanac(BcDocument document, string directory, string imageUrlPrefix)
        {
            using (var stream = new FileStream(Path.Combine(directory, "almanac.html"), FileMode.Create))
            {
                ExportAlmanac(document, stream, imageUrlPrefix);
            }
            using (var stream = new FileStream(Path.Combine(directory, "images", "paper.png"), FileMode.Create))
            {
                Properties.Resources.Paper.Save(stream, ImageFormat.Png);
            }
        }

        /// <summary>
        /// write out an almanac for the custom edition
        /// </summary>
        /// <param name="document"></param>
        /// <param name="stream"></param>
        /// <param name="imageUrlPrefix"></param>
        internal static void ExportAlmanac(BcDocument document, Stream stream, string imageUrlPrefix)
        {
            new AlmanacExporter(document, imageUrlPrefix).Export(stream);
        }
    }
}
