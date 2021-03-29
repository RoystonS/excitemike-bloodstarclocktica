using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

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
        private void Write(IEnumerable<string> ss)
        {
            foreach (var s in ss)
            {
                Write(s);
            }
        }
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
            html,body{height:100%}
            body{
                background:#333;
                color:#eee;
                font-family:'PT Serif', serif;
                margin:0;
                font-size:20px;
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
                margin:4px 0 4px 0;
                font-family: 'Nova Script', cursive;
                text-transform:uppercase;
            }
            h1, h2{font-size:48px}
            h3, h4, h5, h6, h7 {font-size:24px}
            hr{width:80%}
            ol.nav {
                flex:0 0 124px;
                font-family:'Roboto Condensed',sans-serif;
                font-size:14px;
                list-style:none;
                display:flex;
                flex-flow:column nowrap;
                margin:0;
                padding:8px;
                height:100vh;
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
                flex:0 1 1000px;
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
                margin:0.5em;
                position:relative;
            }
            .page img{
                max-width:90vw;
            }
            .page-contents{
                margin:0;
                padding:96px 64px;
                display:flex;
                flex-flow: column nowrap;
                align-items: center;
                background-repeat: no-repeat;
                background-size: 384px;
                background-position: top;
                background-position-y: 48px;
                color:#333;
            }
            .spacer{height:220px}
            #synopsis p, #overview p{width:60%}

            /*paper effect*/
            .page::before{
                content:"""";
                position:absolute;
                left:0;
                top:0;
                right:0;
                bottom:0;
                box-shadow:0 0 4px #999, 0 0 96px #966e49 inset;
                z-index:-1;
                background-color:#eadbca;
            }

            .generated-by{
              list-style:none;
              margin:0;
              padding:0;
              text-align:center;
              font-size:14px;
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
                top: 96px;
                left: 64px;
                letter-spacing:-8px;
                width:unset;
                font-size:36px;
                margin:0;
            }
            p{
                margin-top:0.5em;
                margin-bottom:0.5em;
            }
            .inline-logo{
                float:left;
                margin:-8px 8px 0 -18%;
                width:128px;
            }
            #synopsis p{
                font-family: 'MedievalSharp', cursive;
                color:#933;
            }
            #overview p{
                font-family: 'MedievalSharp', cursive
            }
            p.ability{
                width:60%;
                font-family:'Roboto Condensed',sans-serif;
                text-align:center;
            }
            p.flavor{
                width:60%;
                font-style:italic;
                color:#704c29;
                text-align:center;
                font-size:16px;
            }
            p.overview{
                width:80%;
            }
            p.example{
                width:80%;
            }
            p.how-to-run{
                width:80%;
            }
            p.tip{
                width:80%;
                color:#933;
                padding:20px;
                background:rgba(255, 255, 255, 0.35);
                border:4px solid #933;
            }

            /* big initial letter */
            .page-contents p.overview:nth-child(6)::first-letter {
                font-family: 'MedievalSharp', cursive;
                font-size: 5rem;
                float:left;
                margin:0 4px 0 -8px;
            }

            /* bullets */
            p.overview{
                position:relative;
                margin-left:40px;
            }
            p.overview::before {
                content:'♦';
                font-size:28px;
                position:absolute;
                line-height:0.9;
                top:0;
                left:-24px;
            }
            p.overview:nth-child(6) {
                margin-left:0;
            }
            p.overview:nth-child(6)::before {
                content:none;
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
                body{font-size:16px;}
                p.flavor{font-size:14px;}
                .page-contents p.overview:nth-child(6)::first-letter {font-size: 4rem;}
                h1, h2{font-size:36px}
                h3, h4, h5, h6, h7 {font-size:18px}
                .team{
                    font-size:20px;
                    letter-spacing:-4px;
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
                #synopsis p, #overview p {width:100%}
                .team{
                    font-size:3vw;
                    letter-spacing:0;
                    top:10vw;
                }
                p.ability, p.flavor, p.overview, p.example, p.how-to-run{
                    width:80vw%;
                }
                p.tip{width:75vw;}
                .inline-logo{margin-left:0}
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
                .{name} p.overview::before,
                .{name} p.overview:nth-child(6)::first-letter {{
                    color:#{colorHex};
                }}
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
        private IEnumerable<string> SplitLines(string s)
        {
            return Regex.Split(s, @"[\r\n]+")
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrEmpty(x));
        }
        private IEnumerable<string> SurroundItems(IEnumerable<string> items, string before, string after)
        {
            foreach (var item in items)
            {
                yield return before;
                yield return item;
                yield return after;
            }
        }
        private void WriteParagraphs(string original, string cssClass)
        {
            var before = string.IsNullOrWhiteSpace(cssClass) ? "<p>" : $@"<p class=""{cssClass}"">";
            Write(SurroundItems(SplitLines(original), before, "</p>"));
        }
        private void Synopsis()
        {
            if (!string.IsNullOrWhiteSpace(document.Meta.Synopsis))
            {
                Write(@"<li class=""page"" id=""synopsis""><div class=""page-contents"">");
                WriteParagraphs(document.Meta.Synopsis, null);
                Write($@"<img src=""{BcExport.UrlCombine(imageUrlPrefix, "logo.png")}"" alt=""{document.Meta.Name}"">");
                Write($@"</div></li>");
            }
        }
        private void Overview()
        {
            if (!string.IsNullOrWhiteSpace(document.Meta.Overview))
            {
                Write(@"<li class=""page"" id=""overview""><div class=""page-contents"">");
                var inlineLogo = $@"<img src=""{BcExport.UrlCombine(imageUrlPrefix, "logo.png")}"" alt=""{document.Meta.Name}"" class=""inline-logo"">";
                WriteParagraphs(inlineLogo + document.Meta.Overview, null);
                Write($@"</div></li>");
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
                if (!string.IsNullOrWhiteSpace(character.Ability))
                {
                    Write(@"<p class=""ability"">");
                    Write(character.Ability);
                    Write("</p>");
                }

                // line
                Write("<hr>");

                // flavor
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Flavor))
                {
                    WriteParagraphs("“" + character.AlmanacEntry.Flavor + "”", "flavor");
                }

                // overview
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Overview))
                {
                    WriteParagraphs(character.AlmanacEntry.Overview, "overview");
                }

                // Examples
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Examples))
                {
                    Write(@"<h3>Examples</h3>");
                    WriteParagraphs(character.AlmanacEntry.Examples, "example");
                }

                // How to run
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.HowToRun))
                {
                    Write(@"<h3>How to Run</h3>");
                    WriteParagraphs(character.AlmanacEntry.HowToRun, "how-to-run");
                }

                // Tips
                if (!string.IsNullOrWhiteSpace(character.AlmanacEntry.Tip))
                {
                    WriteParagraphs(character.AlmanacEntry.Tip, "tip");
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
